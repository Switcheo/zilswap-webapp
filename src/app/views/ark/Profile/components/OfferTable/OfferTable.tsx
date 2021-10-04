import {
  Box, BoxProps, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Asset } from "app/store/types";
import { AppTheme } from "app/theme/types";
import BigNumber from "bignumber.js";
import cls from "classnames";
import dayjs from "dayjs";
import React from "react";
import ArkCollapsibleRow from "../ArkCollapsibleRow";
import { BidRow } from "../ArkCollapsibleRow/ArkCollapsibleRow";
import { ArkPaginator } from "app/components";

interface Props extends BoxProps {
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
  { align: 'left', value: "Item" }, { align: "right", value: "Bids" },
  { align: "right", value: "USD Price" }, { align: "center", value: "Offer Score" },
  { align: "center", value: "To" }, { align: "center", value: "Offered on" }, { align: "center", value: "Expiration" },
  { align: "center", value: "Action" },
]

const TEMP_ASSET: Asset = {
  type: "image",
  filename: "",
  url: "",
  mime_type: "",
}

const OfferTable: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));

  const acceptBid = () => {

  }

  const cancelBid = () => {

  }

  const TEMP_DATA: BidRow[] = [
    {
      bid_id: 1, bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { token_id: 1234, asset: TEMP_ASSET },
      usdPrice: new BigNumber(100), bidAverage: "lower than average", user: { name: "Tom" }, bidTime: dayjs("12/07/21"),
      expiration: dayjs("12/07/21"), status: "active",
      actions: { accept: { label: "Accept", action: acceptBid }, decline: { label: "Decline", action: cancelBid } }
    },
    {
      bid_id: 2, bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { token_id: 1234, asset: TEMP_ASSET },
      usdPrice: new BigNumber(100), bidAverage: "lower than average", user: { name: "Tom" }, bidTime: dayjs("12/07/21"),
      expiration: dayjs("12/07/21"), status: "active",
      actions: { accept: { label: "Accept", action: acceptBid }, decline: { label: "Decline", action: cancelBid } }
    },
    {
      bid_id: 3, bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { token_id: 1234, asset: TEMP_ASSET },
      usdPrice: new BigNumber(100), bidAverage: "lower than average", user: { name: "Tom" }, bidTime: dayjs("12/07/21"),
      expiration: dayjs("12/07/21"), status: "active",
      actions: { accept: { label: "Accept", action: acceptBid }, decline: { label: "Decline", action: cancelBid } }
    },
    {
      bid_id: 4, bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { token_id: 1234, asset: TEMP_ASSET },
      usdPrice: new BigNumber(100), bidAverage: "lower than average", user: { name: "Tom" }, bidTime: dayjs("12/07/21"),
      expiration: dayjs("12/07/21"), status: "active",
      actions: { accept: { label: "Accept", action: acceptBid }, decline: { label: "Decline", action: cancelBid } }
    },
  ]

  return (
    <Box className={cls(classes.root, className)}>
      {!isXs && (
        <TableContainer   {...rest} >
          <Table>
            <TableHead>
              <TableRow>
                {HEADERS.map((header, index) => (
                  <TableCell align={header.align} className={classes.headCell} key={`offers-${index}`}>{header.value}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TEMP_DATA.map((data) => (
                <ArkCollapsibleRow baseRow={data} extraRows={TEMP_DATA} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {isXs && (
        <Card>

        </Card>
      )}
      <ArkPaginator itemPerPage={2} totalItem={TEMP_DATA.length} />
    </Box>
  );
};

export default OfferTable;