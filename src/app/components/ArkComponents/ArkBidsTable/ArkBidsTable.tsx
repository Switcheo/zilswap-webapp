import {
  BoxProps, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useMediaQuery, useTheme
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArkPaginator } from "app/components";
import { Cheque } from "app/store/types";
import { AppTheme } from "app/theme/types";
import React from "react";
import BidCard from "./BidCard";
import BidRow from "./BidRow";

const ITEMS_PER_PAGE = 2

interface Props extends BoxProps {
  bids: Cheque[]
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2)
  }, container: {
  },
  headCell: {
    borderBottom: "1px solid #29475A",
    padding: "8px 16px",
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
  bearItem: {
    padding: "0",
  }
}));

type CellAligns = "right" | "left" | "inherit" | "center" | "justify" | undefined;
interface HeadersProp {
  align: CellAligns;
  value: string;
}

const HEADERS: HeadersProp[] = [
  { align: 'left', value: "Item" },
  { align: "right", value: "Price" },
  { align: "center", value: "Versus Floor" },
  { align: "center", value: "Bidder" },
  { align: "center", value: "Offered" },
  { align: "center", value: "Expires" },
  { align: "center", value: "Actions" },
]

const ArkBidsTable: React.FC<Props> = (props: Props) => {
  const { children, className, bids, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  // const [bid, setBid] = useState<Cheque | undefined>(undefined);

  // const acceptBid = (newBid?: Cheque) => {
  //   setBid(newBid);
  // }

  // const cancelBid = () => {
  //   setBid(undefined);
  // }

  return (<>
    {
      isXs ?
      <>
        {bids.map((data) => (
          <BidCard isBuyer={data.side === 'buy'} bid={data} />
        ))}
      </>
      :
      <TableContainer {...rest}>
        <Table>
          <TableHead>
            <TableRow>
              {HEADERS.map((header, index) => (
                <TableCell
                  key={`offers-${index}`}
                  className={classes.headCell}
                  align={header.align}
                >
                  {header.value}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bids.map((data) => (
              <BidRow bid={data} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    }
    <ArkPaginator itemPerPage={ITEMS_PER_PAGE} totalItem={bids.length} />
    {/* {bid && <BidsDialog showDialog={!!bid} onCloseDialog={() => setBid(undefined)} bid={bid} isOffer={true} />} */}
  </>)
};

export default ArkBidsTable;
