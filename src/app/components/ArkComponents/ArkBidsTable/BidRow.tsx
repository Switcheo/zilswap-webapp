import React, { Fragment, useState, useMemo } from "react";
import { Avatar, Box, BoxProps, CircularProgress, IconButton,
  ListItemIcon, MenuItem, TableCell, TableRow, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import cls from "classnames";
import BigNumber from "bignumber.js"
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import { darken } from '@material-ui/core/styles';
import { ObservedTx } from "zilswap-sdk";
import { AppTheme } from "app/theme/types";
import { Cheque, WalletState } from "app/store/types";
import { bnOrZero, toSignificantNumber, useAsyncTask, useToaster, useValueCalculators } from "app/utils";
import { RootState, TokenState } from "app/store/types";
import { getChequeStatus } from "core/utilities/ark"
import { ArkOwnerLabel } from "app/components";
import { ZilswapConnector } from "core/zilswap";
import { logger, ArkClient } from "core/utilities";
import { getMarketplace } from "app/saga/selectors";
import { BLOCKS_PER_MINUTE } from "core/zilo/constants";
import { ReactComponent as DownArrow } from "./assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "./assets/up-arrow.svg";

interface Props extends BoxProps {
  showItem: boolean
  bid: Cheque
  relatedBids?: Cheque[]
  currentTime: Dayjs
  blockTime: Dayjs
  currentBlock: number
  onAction?: (matchedCheque: Cheque, observedTx: ObservedTx) => void;
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
  imageContainer: {
    minWidth: 35,
  },
  image: {
    height: 25,
    width: 25,
  },
  text: {
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '0.1px',
  },
  amount: {
    fontWeight: 700,
  },
  cell: {
    color: theme.palette.text?.primary,
    margin: 0,
    border: "none",
    maxWidth: 200,
  },
  bodyCell: {
    extend: ['text', 'cell'],
    padding: theme.spacing(2.5, 1),
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
  doubleInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '& > span:last-child': {
      fontSize: 10,
      opacity: 0.6,
      '&.large': {
        fontSize: 12,
      }
    }
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
  const { bid: baseBid, relatedBids = [], currentTime: now, currentBlock, blockTime, showItem, onAction } = props;
  const [expand, setExpand] = useState(false);
  const classes = useStyles();
  const toaster = useToaster();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const { exchangeInfo, pendingTxs } = useSelector(getMarketplace);
  const valueCalculators = useValueCalculators();
  const [runCancelBid, cancelLoading] = useAsyncTask(`cancelBid-${baseBid.id}`, e => toaster(e?.message));
  const [runAcceptBid, acceptLoading] = useAsyncTask(`acceptBid-${baseBid.id}`, e => toaster(e?.message));
  const userAddress = walletState.wallet?.addressInfo.byte20.toLowerCase()

  const isPendingTx = useMemo(() => {
    for (const pendingTx of Object.values(pendingTxs)) {
      if (pendingTx.chequeHash === baseBid.chequeHash)
        return true;
    }

    return false;
  }, [pendingTxs, baseBid])

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

      const zilswap = ZilswapConnector.getSDK();
      const voidChequeResult = await arkClient.voidCheque({
        publicKey,
        signature,
        chequeHash,
      }, zilswap);

      const observedTx = {
        hash: voidChequeResult.id!,
        deadline: Number.MAX_SAFE_INTEGER,
      };
      zilswap.observeTx(observedTx);
      onAction?.(bid, observedTx);
      toaster("Cancellation submitted", { hash: voidChequeResult.id! });
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

      const arkClient = new ArkClient(wallet.network);
      const result = await arkClient.getNftToken(bid.token!.collection!.address, bid.token!.tokenId);
      const token = result.result.model;

      if (typeof token?.collection?.royaltyBps !== "number")
        throw new Error("Could not retrieve collection information");

      const totalFeeBps = bnOrZero(exchangeInfo.baseFeeBps).plus(bid.token.collection.royaltyBps);
      const feeAmount = priceAmount.times(totalFeeBps).dividedToIntegerBy(10000).plus(1);

      const nonce = new BigNumber(Math.random()).times(2147483647).decimalPlaces(0).toString(10); // int32 max 2147483647
      const currentBlock = ZilswapConnector.getCurrentBlock();
      const expiry = currentBlock + 25; // blocks
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

      const zilswap = ZilswapConnector.getSDK();
      const execTradeResult = await arkClient.executeTrade({
        buyCheque: bid,
        sellCheque,
        nftAddress: bid.token.collection.address,
        tokenId: bid.token.tokenId.toString(10),
      }, zilswap);

      const observedTx = {
        hash: execTradeResult.id!,
        deadline: Number.MAX_SAFE_INTEGER,
      };
      zilswap.observeTx(observedTx);
      onAction?.(bid, observedTx);
      toaster("Accept TX submitted", { hash: execTradeResult.id! });
      logger("exec trade result", execTradeResult)
    });
  }

  return (
    <Fragment>
      {
        (expand ? [baseBid].concat(...relatedBids) : [baseBid]).map((bid: Cheque, index: number) => {
          const status = getChequeStatus(bid, currentBlock)
          const expiryTime = blockTime.add((bid.expiry - currentBlock) * BLOCKS_PER_MINUTE, 'minutes')
          const priceToken = tokenState.tokens[toBech32Address(bid.price.address)]
          if (!priceToken) return null
          const priceAmount = new BigNumber(bid.price.amount).shiftedBy(-priceToken.decimals)
          const usdValue = valueCalculators.amount(tokenState.prices, priceToken, new BigNumber(bid.price.amount));

          const getExpiryText = () => {
            if (expiryTime.isBefore(now)) return expiryTime.format("D MMM YYYY")
            const hours = expiryTime.diff(now, 'hours')
            if (hours > 48) return expiryTime.format("D MMM YYYY")
            if (hours > 24) return 'Tomorrow'
            if (hours > 1) return `In ${hours} hours`
            const mins = expiryTime.diff(now, 'minutes')
            if (mins > 5) return `In ${mins} minutes`
            return 'In a few minutes'
          }

          return <TableRow key={bid.id} className={cls(classes.row, { [classes.firstRow]: index === 0, [classes.slideAnimation]: index > 0 })}>
            {
              showItem &&
              <TableCell align="left" className={cls(classes.bodyCell, classes.firstCell)}>
                {
                  index === 0 &&
                  <Link className={classes.link} to={`/ark/collections/${toBech32Address(bid.token.collection.address)}/${bid.token.tokenId}`}>
                    <MenuItem className={classes.item} button={false}>
                      <ListItemIcon className={classes.imageContainer}><Avatar className={classes.image} alt="NFT Image" src={bid.token.asset.url} /></ListItemIcon>
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
              <Box className={classes.doubleInfo}>
                <Box component="span">
                  <strong className={classes.amount}>
                    {toSignificantNumber(priceAmount)}
                  </strong> {priceToken.symbol}
                </Box>
                <Box className="large" component="span">${usdValue.toFormat(2)}</Box>
              </Box>
            </TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>-</TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>
              <ArkOwnerLabel user={bid.initiator} address={bid.initiatorAddress} />
            </TableCell>
            <TableCell align="center" className={cls(classes.bodyCell, { [classes.withBorder]: expand })}>
              <Box className={classes.doubleInfo}>
                <Box component="span">{getExpiryText()}</Box>
                <Box component="span">Block {bid.expiry}</Box>
              </Box>
            </TableCell>
            <TableCell align="center" className={cls(classes.actionCell, classes.lastCell, { [classes.withBorder]: expand })}>
              {status === 'Active' && bid.initiatorAddress === userAddress &&
                <IconButton onClick={() => cancelBid(bid)} className={classes.iconButton}>
                  {(cancelLoading || isPendingTx) && (
                    <CircularProgress size={16} />
                  )}
                  {!(cancelLoading || isPendingTx) && (
                    <Typography className={classes.buttonText}>Cancel</Typography>
                  )}
                </IconButton>
              }
              {status === 'Active' && bid.token.ownerAddress === userAddress &&
                <IconButton onClick={() => acceptBid(bid)} className={classes.iconButton}>
                  {(acceptLoading || isPendingTx) && (
                    <CircularProgress size={16} />
                  )}
                  {!(acceptLoading || isPendingTx) && (
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
    </Fragment>
  );
};

export default Row;
