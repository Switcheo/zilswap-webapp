import React from "react";
import {
  Box, BoxProps, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useMediaQuery, useTheme
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArkPaginator } from "app/components";
import { Cheque } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useBlockTime } from "app/utils";
import BidCard from "./BidCard";
import BidRow from "./BidRow";

const ITEMS_PER_PAGE = 2

interface Props extends BoxProps {
  bids: Cheque[]
  showItem?: boolean
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  headerCell: {
    color: 'rgba(255, 255, 255, 0.5)',
    borderBottom: "1px solid #29475A",
    padding: "8px 16px",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.2px',
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
    borderBottom: "1px solid #29475A",
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [blockTime, currentBlock] = useBlockTime();

  // const [bid, setBid] = useState<Cheque | undefined>(undefined);

  // const acceptBid = (newBid?: Cheque) => {
  //   setBid(newBid);
  // }

  // const cancelBid = () => {
  //   setBid(undefined);
  // }

  if (currentBlock === 0) return null // TODO: use loading gif instead

  return <Box className={classes.root}>
    {
      isMobile ?
      <>
        {bids.map((data) => (
          <BidCard bid={data} blockTime={blockTime} currentBlock={currentBlock} showItem={showItem} />
        ))}
      </>
      :
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
            {bids.map((data) => (
              <BidRow bid={data} blockTime={blockTime} currentBlock={currentBlock} showItem={showItem} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    }
    <ArkPaginator itemPerPage={ITEMS_PER_PAGE} totalItem={bids.length} />
    {/* {bid && <BidsDialog showDialog={!!bid} onCloseDialog={() => setBid(undefined)} bid={bid} isOffer={true} />} */}
  </Box>
};

export default ArkBidsTable;
