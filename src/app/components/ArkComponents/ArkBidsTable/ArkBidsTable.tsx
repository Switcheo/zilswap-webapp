import React, { useState, } from "react";
import {
  Box, BoxProps, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useMediaQuery, useTheme
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ObservedTx } from "zilswap-sdk";
import groupBy from "lodash/groupBy";
import { useDispatch, useSelector } from "react-redux";
import cls from "classnames"
import { ArkBox, ArkPaginator, ArkLoadingSkeleton } from "app/components";
import { Cheque } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useBlockTime, useTaskSubscriber, useValueCalculators } from "app/utils";
import { RootState, TokenState } from "app/store/types";
import { getMarketplace } from "app/saga/selectors";
import { actions } from "app/store";
import BidCard from "./BidCard";
import BidRow from "./BidRow";

const ITEMS_PER_PAGE = 5

interface Props extends BoxProps {
  bids: Cheque[];
  showItem?: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    padding: theme.spacing(2, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  mobileContainer: {
    marginTop: theme.spacing(2),
  },
  headerCell: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    borderBottom: theme.palette.border,
    padding: "8px 16px",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.2px',
    opacity: 0.5
  },
  iconButton: {
    color: "#DEFFFF",
    borderRadius: "12px",
    background: "rgba(222, 255, 255, 0.1)",
  },
  buttonText: {
    color: "#DEFFFF",
    opacity: "100%",
  },
  bodyCell: {
    borderBottom: theme.palette.border,
    padding: "8px 16px",
  },
  emptyState: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
    '&.row': {
      paddingTop: theme.spacing(3),
      borderBottom: 'none',
    },
    '&.box': {
      padding: theme.spacing(2, 0),
    }
  },
}));

type CellAligns = "right" | "left" | "inherit" | "center" | "justify" | undefined;
interface HeadersProp {
  align: CellAligns;
  value: string;
}

const ITEM_HEADER: HeadersProp = { align: 'left', value: "Item" };
const HEADERS: HeadersProp[] = [
  { align: "center", value: "Date" },
  { align: "center", value: "Price" },
  { align: "center", value: "Versus Floor" },
  { align: "center", value: "Bidder" },
  { align: "center", value: "Expires" },
  { align: "center", value: "Status" },
]

const ArkBidsTable: React.FC<Props> = (props: Props) => {
  const { bids, showItem = true } = props;
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const { pendingTxs } = useSelector(getMarketplace);
  const vc = useValueCalculators();
  const [pageNumber, setPageNumber] = useState<number>(0);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [blockTime, currentBlock, currentTime] = useBlockTime();
  const [isLoading] = useTaskSubscriber("getBids");

  const handlePageChange = (page: number) => {
    setPageNumber(page - 1)
  }

  const appendPendingTx = (matchedCheque: Cheque, observedTx: ObservedTx) => {
    if (pendingTxs[observedTx.hash]) return;
    dispatch(actions.MarketPlace.listenPendingTx({
      txHash: observedTx.hash,
      chequeHash: matchedCheque.chequeHash,
    }))
  }

  if (currentBlock === 0 || isLoading) return <ArkLoadingSkeleton type={isMobile ? "Card" : "Table"} row={5} />

  const headers = showItem ? [ITEM_HEADER, ...HEADERS] : HEADERS

  return isMobile ?
    bids.length === 0 ?
      <Box className={cls(classes.emptyState, 'box')}>No bid data yet.</Box>
      :
      <Box className={classes.mobileContainer}>
        {
          Object.entries(groupBy(bids, (bid) => bid.token.collectionAddress + bid.token.id)).map(([k, v]) => {
            const bids = v.sort((lhs, rhs) => {
              const diff = vc.usd(tokenState, lhs.price.address, lhs.price.amount).comparedTo(vc.usd(tokenState, rhs.price.address, rhs.price.amount)) * -1
              if (diff === 0) return lhs.expiry > rhs.expiry ? -1 : 1
              return diff
            })
            return (
              <BidCard
                onAction={appendPendingTx}
                bid={bids[0]}
                relatedBids={bids.slice(1)}
                blockTime={blockTime}
                currentBlock={currentBlock}
                showItem={showItem}
                key={k}
              />
            )
          })
        }
      </Box>
    :
    <ArkBox variant="base" className={classes.container}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell
                  key={`offers-${index}`}
                  className={classes.headerCell}
                  align={header.align}
                >
                  {header.value}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.slice(pageNumber * ITEMS_PER_PAGE, (pageNumber + 1) * ITEMS_PER_PAGE).map((data) => (
              <BidRow
                onAction={appendPendingTx}
                bid={data}
                currentTime={currentTime}
                blockTime={blockTime}
                currentBlock={currentBlock}
                showItem={showItem}
                key={data.id}
              />
            ))}
            {
              bids.length === 0 &&
              <TableRow>
                <TableCell colSpan={headers.length} className={cls(classes.emptyState, 'row')}>
                  No bid data yet.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>
      <ArkPaginator itemPerPage={ITEMS_PER_PAGE} totalItem={bids.length} onPageChange={handlePageChange} />
    </ArkBox>
};

export default ArkBidsTable;
