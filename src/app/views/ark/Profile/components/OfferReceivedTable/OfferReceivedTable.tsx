import {
  Box, BoxProps, TableContainer, Table, TableBody, TableCell,
  TableRow, TableHead, IconButton, Typography, MenuItem, ListItemIcon,
  Avatar
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React from "react";

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
  { align: "center", value: "Status" }, { align: "center", value: "Action" },
]

const TEMP_DATA = [
  { bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { id: 1234, src: "" }, usdPrice: new BigNumber(100), score: "lower than average", offeredUser: { name: "Tom" }, offeredOn: "12/07/21", expiration: "12/07/21", status: "active" },
  { bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { id: 1234, src: "" }, usdPrice: new BigNumber(100), score: "lower than average", offeredUser: { name: "Tom" }, offeredOn: "12/07/21", expiration: "12/07/21", status: "active" },
  { bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { id: 1234, src: "" }, usdPrice: new BigNumber(100), score: "lower than average", offeredUser: { name: "Tom" }, offeredOn: "12/07/21", expiration: "12/07/21", status: "active" },
  { bidAmount: new BigNumber(100), bidCurrency: "zil", nft: { id: 1234, src: "" }, usdPrice: new BigNumber(100), score: "lower than average", offeredUser: { name: "Tom" }, offeredOn: "12/07/21", expiration: "12/07/21", status: "active" },
]

const OfferReceivedTable: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box className={cls(classes.root, className)}>
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
              <TableRow>
                <TableCell align="left" className={classes.bodyCell}>
                  <MenuItem className={classes.bearItem} button={false}>
                    <ListItemIcon>
                      <Avatar alt="Remy Sharp" src={data.nft.src} />
                    </ListItemIcon>
                    <Typography>  {data.nft.id}</Typography>
                  </MenuItem>
                </TableCell>
                <TableCell align="right" className={classes.bodyCell}>{data.bidCurrency}</TableCell>
                <TableCell align="right" className={classes.bodyCell}>{data.usdPrice.toString()}</TableCell>
                <TableCell align="center" className={classes.bodyCell}>{data.score}</TableCell>
                <TableCell align="center" className={classes.bodyCell}>{data.offeredUser.name}</TableCell>
                <TableCell align="center" className={classes.bodyCell}>{data.offeredOn}</TableCell>
                <TableCell align="center" className={classes.bodyCell}>{data.expiration}</TableCell>
                <TableCell align="center" className={classes.bodyCell}>{data.status}</TableCell>
                <TableCell align="center" className={classes.bodyCell}>
                  <IconButton className={classes.iconButton}>
                    <Typography className={classes.buttonText}>Cancel</Typography>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OfferReceivedTable;