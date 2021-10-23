import React, { Fragment, useState } from "react";
import { Avatar, Box, BoxProps, CircularProgress, IconButton, ListItemIcon, MenuItem, TableCell, TableRow, Typography } from "@material-ui/core";
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
import { bnOrZero, useAsyncTask, useToaster, useValueCalculators } from "app/utils";
import { RootState, TokenState } from "app/store/types";
import { getChequeStatus } from "core/utilities/ark"
import { ArkOwnerLabel } from "app/components";
import { ZilswapConnector } from "core/zilswap";
import { logger, ArkClient } from "core/utilities";
import { getMarketplace } from "app/saga/selectors";
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
  const toaster = useToaster();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const { exchangeInfo } = useSelector(getMarketplace);
  const valueCalculators = useValueCalculators();
  const [runCancelBid, cancelLoading] = useAsyncTask(`cancelBid-${baseBid.id}`, e => toaster(e?.message));
  const [runAcceptBid, acceptLoading] = useAsyncTask(`acceptBid-${baseBid.id}`, e => toaster(e?.message));
  const userAddress = walletState.wallet?.addressInfo.byte20.toLowerCase()

  const cancelBid = (bid: Cheque) => {
    // TODO: refactor
    runCancelBid(async () => {
      if (!walletState.wallet) return;
      const wallet = walletState.wallet;

      const arkClient = new ArkClient(wallet.network);
      const chequeHash = arkClient.arkChequeHash({
        expiry: bid.expiry,
        feeAmount: bnOrZero(bid.feeAmount),
        nonce: bid.nonce,
        price: {
          address: bid.price.address,
          amount: bnOrZero(bid.price.amount),
        },
        side: bid.side === "buy" ? "Buy" : "Sell",
        token: {
          address: bid.token?.collection?.address,
          id: bid.token?.tokenId,
        },
      });

      const message = await arkClient.arkMessage("Void", chequeHash);

      const { signature, publicKey } = (await wallet.provider!.wallet.sign(message as any)) as any

      const voidChequeResult = await arkClient.voidCheque({
        publicKey,
        signature,
        chequeHash,
      }, ZilswapConnector.getSDK());

      logger("void cheque result", voidChequeResult);
    });
  }

  const acceptBid = (bid: Cheque) => {
    // TODO: refactor
    runAcceptBid(async () => {
      if (!walletState.wallet || !exchangeInfo) return;
      const wallet = walletState.wallet;
      const priceAmount = new BigNumber(bid.price.amount);
      const price = { amount: priceAmount, address: bid.price.address };
      const feeAmount = priceAmount.times(exchangeInfo.baseFeeBps).dividedToIntegerBy(10000).plus(1);

      const arkClient = new ArkClient(wallet.network);
      const nonce = new BigNumber(Math.random()).times(2147483647).decimalPlaces(0).toString(10); // int32 max 2147483647
      const currentBlock = ZilswapConnector.getCurrentBlock();
      const expiry = currentBlock + 300; // blocks
      const message = arkClient.arkMessage("Execute", arkClient.arkChequeHash({
        side: "Sell",
        token: {
          address: bid.token?.collection?.address,
          id: bid.token?.tokenId.toString(10),
        },
        price,
        feeAmount,
        expiry,
        nonce,
      }));

      const { signature, publicKey } = (await wallet.provider!.wallet.sign(message as any)) as any

      const sellCheque: ArkClient.ExecuteSellCheque = {
        side: "sell",
        initiatorAddress: wallet.addressInfo.byte20.toLowerCase(),
        expiry,
        price: {
          address: price.address,
          amount: price.amount.toString(10),
        },
        feeAmount: feeAmount.toString(10),
        nonce,
        publicKey: `0x${publicKey}`,
        signature: `0x${signature}`,
      }

      const buyChequeHash = arkClient.arkChequeHash({
        side: "Buy",
        token: {
          address: bid.token?.collection?.address,
          id: bid.token?.tokenId.toString(10),
        },
        price,
        feeAmount,
        expiry: bid.expiry,
        nonce: bid.nonce,
      });

      const execTradeResult = await arkClient.executeTrade({
        buyCheque: bid,
        sellCheque,
        matchedChequeHash: `0x${buyChequeHash}`,
        nftAddress: bid.token.collection.address,
        tokenId: bid.token.tokenId.toString(10),
      }, ZilswapConnector.getSDK());

      logger("exec trade result", execTradeResult)
    });
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
                <IconButton onClick={() => cancelBid(bid)} className={classes.iconButton}>
                  {cancelLoading && (
                    <CircularProgress size={16} />
                  )}
                  {!cancelLoading && (
                    <Typography className={classes.buttonText}>Cancel</Typography>
                  )}
                </IconButton>
              }
              {status === 'Active' && bid.token.ownerAddress === userAddress &&
                <IconButton onClick={() => acceptBid(bid)} className={classes.iconButton}>
                  {acceptLoading && (
                    <CircularProgress size={16} />
                  )}
                  {!acceptLoading && (
                    <Typography className={classes.buttonText}>Accept</Typography>
                  )}
                </IconButton>
              }
              {(status !== 'Active' || (bid.token.ownerAddress !== userAddress && bid.initiatorAddress !== userAddress)) &&
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
