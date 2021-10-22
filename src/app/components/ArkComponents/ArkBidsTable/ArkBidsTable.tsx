import React, { useState } from "react";
import {
  Box, BoxProps, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useMediaQuery, useTheme
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import groupBy from "lodash/groupBy";
import { useSelector } from "react-redux";
import { ArkPaginator } from "app/components";
import { Cheque } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useBlockTime, useValueCalculators } from "app/utils";
import { RootState, TokenState } from "app/store/types";
import BidCard from "./BidCard";
import BidRow from "./BidRow";

const ITEMS_PER_PAGE = 5

interface Props extends BoxProps {
  bids: Cheque[]
  showItem?: boolean
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    borderRadius: 12,
    border: theme.palette.border,
    background: theme.palette.type === "dark" ? "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)" : "transparent",
    padding: theme.spacing(3, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  container: {
    width: '100%',
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
}));

type CellAligns = "right" | "left" | "inherit" | "center" | "justify" | undefined;
interface HeadersProp {
  align: CellAligns;
  value: string;
}

const ITEM_HEADER: HeadersProp = { align: 'left', value: "Item" };
const HEADERS: HeadersProp[] = [
  { align: "center", value: "Date" },
  { align: "right", value: "Price" },
  { align: "center", value: "Versus Floor" },
  { align: "center", value: "Bidder" },
  { align: "center", value: "Expires" },
  { align: "center", value: "Actions" },
]

const ArkBidsTable: React.FC<Props> = (props: Props) => {
  const { bids, showItem = true } = props;
  const classes = useStyles();
  const theme = useTheme();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const vc = useValueCalculators();
  const [pageNumber, setPageNumber] = useState<number>(0);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [blockTime, currentBlock] = useBlockTime();

  // const [bid, setBid] = useState<Cheque | undefined>(undefined);

  // const acceptBid = (newBid?: Cheque) => {
  //   setBid(newBid);
  // }

  // const cancelBid = () => {
  //   setBid(undefined);
  // }

  const handlePageChange = (page: number) => {
    setPageNumber(page - 1)
  }

  if (currentBlock === 0) return null // TODO: use loading gif instead

  return <Box className={classes.root}>
    <Box className={classes.container}>
    {
      isMobile ?
        Object.entries(groupBy(bids, (bid) => bid.token.collectionAddress + bid.token.id)).map(([k, v]) => {
          const bids = v.sort((lhs, rhs) => {
            const diff = vc.usd(tokenState, lhs.price.address, lhs.price.amount).comparedTo(vc.usd(tokenState, rhs.price.address, rhs.price.amount)) * -1
            if (diff === 0) return lhs.expiry > rhs.expiry ? -1 : 1
            return diff
          })
          return <BidCard bid={bids[0]} relatedBids={bids.slice(1)} blockTime={blockTime} currentBlock={currentBlock} showItem={showItem} key={k} />
        })
        :
        [
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {(showItem ? [ITEM_HEADER, ...HEADERS] : HEADERS).map((header, index) => (
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
                  <BidRow bid={data} blockTime={blockTime} currentBlock={currentBlock} showItem={showItem} key={data.id} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>,
          <ArkPaginator itemPerPage={ITEMS_PER_PAGE} totalItem={bids.length} onPageChange={handlePageChange} />
        ]
    }
    </Box>
  </Box>
};

export default ArkBidsTable;
