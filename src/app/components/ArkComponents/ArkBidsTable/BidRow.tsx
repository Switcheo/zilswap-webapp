import React, { Fragment, useState } from "react";
import { Avatar, Box, BoxProps, IconButton, ListItemIcon, MenuItem, TableCell, TableRow, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import cls from "classnames";
import BigNumber from "bignumber.js"
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import { darken } from '@material-ui/core/styles';
import { AppTheme } from "app/theme/types";
import { Cheque, WalletState } from "app/store/types";
import { useValueCalculators } from "app/utils";
import { RootState, TokenState } from "app/store/types";
import { getChequeStatus } from "core/utilities/ark"
import { ArkOwnerLabel } from "app/components";
import { ReactComponent as DownArrow } from "./assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "./assets/up-arrow.svg";

interface Props extends BoxProps {
  showItem: boolean
  bid: Cheque
  relatedBids?: Cheque[]
  blockTime: Dayjs
  currentBlock: number
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  link: {
    color: '#6BE1FF',
    '&:hover': {
      color: darken('#6BE1FF', 0.1),
    }
  },
  text: {
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '0.1px',
  },
  amount: {
    fontWeight: 800,
  },
  cell: {
    background: theme.palette.type === "dark" ? "transparent" : "rgba(222, 255, 255, 0.5)",
    color: theme.palette.text?.primary,
    margin: 0,
    border: "none",
    maxWidth: 200,
  },
  bodyCell: {
    extend: ['text', 'cell'],
    padding: "8px 16px",
  },
  actionCell: {
    extend: 'cell',
    padding: "8px 0px",
  },
  buttonText: {
    color: theme.palette.text?.primary,
    opacity: "100%",
  },
  iconButton: {
    background: theme.palette.type === "dark" ? 'rgba(222, 255, 255, 0.1)' : 'rgba(107, 225, 255, 0.2)',
    borderRadius: "12px",
    marginRight: 8,
  },
  item: {
    extend: 'text',
    padding: "0",
    maxWidth: 200,
    margin: 0
  },
  withBorder: {
    '&:not(:last-child)': {
      borderBottom: theme.palette.border,
    }
  },
  slideAnimation: {
    animation: `$slideEffect 1000ms linear`,
    padding: 12,
  },
  "@keyframes slideEffect": {
    "100%": { transform: " translateY(0%)" }
  },
  expandCell: {
    extend: 'cell',
    height: 10,
    padding: 0,
    textAlign: "center",
    color: "#FFFFFF",
    border: "none",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
  },
  firstCell: {
    borderTopLeftRadius: "12px",
  },
  lastCell: {
    borderTopRightRadius: "12px",
  },
  row: {
    padding: 12,
    background: theme.palette.type === "dark" ? "transparent" : "rgba(222, 255, 255, 0.5)",
  },
  firstRow: {
    marginTop: theme.spacing(1),
  },
  lastRow: {
    marginBottom: theme.spacing(1),
  },
  arrowIcon: {
    padding: "4px 24px",
    color: "#DEFFFF",
    borderRadius: "12px",
    marginBottom: "12px"
  },
  green: {
    extend: 'text',
    color: "#00FFB0",
  },
  red: {
    extend: 'text',
    color: "#FF5252",
  }
}));

const Row: React.FC<Props> = (props: Props) => {
  const { bid: baseBid, relatedBids = [], currentBlock, blockTime, showItem } = props;
  const [expand, setExpand] = useState(false);
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const valueCalculators = useValueCalculators();
  const userAddress = walletState.wallet?.addressInfo.byte20.toLowerCase()

  const cancelBid = () => {

  }

  const acceptBid = () => {

  }

  return (
    <Fragment>
      <Box mt={1}></Box>
      {
        (expand ? [baseBid].concat(...relatedBids) : [baseBid]).map((bid: Cheque, index: number) => {
          const status = getChequeStatus(bid, currentBlock)
          const expiryTime = blockTime.add(15 * (bid.expiry - currentBlock), 'seconds')
          const priceToken = tokenState.tokens[toBech32Address(bid.price.address)]
          if (!priceToken) return null
          const priceAmount = new BigNumber(bid.price.amount).shiftedBy(-priceToken.decimals)
          const usdValue = valueCalculators.amount(tokenState.prices, priceToken, new BigNumber(bid.price.amount));

          return <TableRow className={cls(classes.row, { [classes.firstRow]: index === 0, [classes.slideAnimation]: index > 0 })}>
            {
              showItem &&
              <TableCell align="left" className={cls(classes.bodyCell, classes.firstCell)}>
                {
                  index === 0 &&
                  <Link className={classes.link} to={`/ark/collections/${toBech32Address(bid.token.collection.address)}/${bid.token.tokenId}`}>
                    <MenuItem className={classes.item} button={false}>
                      <ListItemIcon><Avatar alt="Remy Sharp" src={bid.token.asset.url} /></ListItemIcon>
                      #{bid.token.tokenId}
                    </MenuItem>
                  </Link>
                }
              </TableCell>
            }
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>
              {dayjs(bid.createdAt).format("D MMM YYYY")}
            </TableCell>
            <TableCell align="right" className={cls(classes.bodyCell, { [classes.withBorder]: expand, [classes.firstCell]: !showItem })}>
              <strong className={classes.amount}>
                {priceAmount.toFormat(priceAmount.gte(1) ? 2 : priceToken.decimals)}
              </strong> {priceToken.symbol} (${usdValue.toFormat(2)})
            </TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>NYI</TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>
              <ArkOwnerLabel user={bid.initiator} address={bid.initiatorAddress} />
            </TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>
              {expiryTime.format("D MMM YYYY")}
            </TableCell>
            <TableCell align="center" className={cls(classes.actionCell, classes.lastCell, { [classes.withBorder]: expand })}>
              {status === 'Active' && bid.initiatorAddress === userAddress &&
                <IconButton onClick={() => cancelBid()} className={classes.iconButton}>
                  <Typography className={classes.buttonText}>Cancel</Typography>
                </IconButton>
              }
              {status === 'Active' && bid.token.owner === userAddress &&
                <IconButton onClick={() => acceptBid()} className={classes.iconButton}>
                  <Typography className={classes.buttonText}>Accept</Typography>
                </IconButton>
              }
              {(status !== 'Active' || (bid.token.owner !== userAddress && bid.initiatorAddress !== userAddress)) &&
                <Typography
                  className={cls({
                    [classes.green]: status === 'Active',
                    [classes.red]: status === 'Expired' || status === 'Cancelled'
                  })}
                >
                  {status}
                </Typography>
              }
            </TableCell>
          </TableRow>
        })
      }
      {relatedBids && relatedBids.length > 0 && (
        <TableRow className={cls(classes.row, classes.lastRow)}>
          <TableCell className={classes.expandCell} colSpan={8}>
              <IconButton
                aria-label="expand row"
                size="medium"
                onClick={() => setExpand(!expand)}
                className={classes.arrowIcon}
              >
                {expand ? <UpArrow /> : <DownArrow />}
              </IconButton>
          </TableCell>
        </TableRow>
      )}
      <Box mb={1}></Box>
    </Fragment>
  );
};

export default Row;
