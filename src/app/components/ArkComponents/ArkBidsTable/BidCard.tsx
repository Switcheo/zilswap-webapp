import React, { useState, useMemo } from "react";
import { Avatar, Box, Card, CardContent, CardProps, Collapse, IconButton, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import BigNumber from "bignumber.js"
import dayjs, { Dayjs } from "dayjs";
import { useSelector } from "react-redux";
import { ObservedTx } from "zilswap-sdk";
import { ArkBox, FancyButton } from "app/components";
import { Cheque, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { ArkClient, getChequeStatus, logger } from "core/utilities"
import { RootState, TokenState } from "app/store/types";
import { bnOrZero, truncateAddress, useAsyncTask, useToaster, useValueCalculators } from "app/utils";
import { ZilswapConnector } from "core/zilswap";
import { getMarketplace } from "app/saga/selectors";
import { ReactComponent as DownArrow } from "./assets/down-arrow.svg";
import { ReactComponent as UpArrow } from "./assets/up-arrow.svg";

interface Props extends CardProps {
  showItem: boolean
  bid: Cheque
  relatedBids?: Cheque[]
  blockTime: Dayjs
  currentBlock: number
  onAction?: (matchedCheque: Cheque, observedTx: ObservedTx) => void;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
  item: {
    padding: "0",
    maxWidth: 200,
    margin: 0
  },
  amount: {
    fontWeight: 800,
  },
  dateText: {
    display: "flex",
    flexDirection: "row",
  },
  actionButton: {
    color: "#DEFFFF",
    borderRadius: "12px",
    background: "rgba(222, 255, 255, 0.1)",
    display: "flex",
    width: "50%",
    padding: "12px 32px",
  },
  actionArea: {
    display: "flex",
    justifyContent: "center",
  },
  arrowIcon: {
    padding: "4px 24px",
    color: "#DEFFFF",
    borderRadius: "12px",
    marginBottom: "6px"
  },
  topBorder: {
    borderTop: theme.palette.border,
  },
  green: {
    color: "#00FFB0",
  },
  red: {
    color: "#FF5252",
  },
  buttonText: {
    color: "#DEFFFF",
    padding: "8px, 16px",
  },
  header: {
    color: theme.palette.text!.secondary,
  },
  text: {
    color: theme.palette.text!.primary,
  }
}));

const BidCard: React.FC<Props> = (props: Props) => {
  const { bid, relatedBids, currentBlock, blockTime, showItem, onAction } = props;
  const classes = useStyles();
  const toaster = useToaster();
  const [expand, setExpand] = useState(false);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const { exchangeInfo, pendingTxs } = useSelector(getMarketplace);
  const valueCalculators = useValueCalculators();
  const [runCancelBid, cancelLoading] = useAsyncTask(`cancelBid-${bid.id}`, e => toaster(e?.message));
  const [runAcceptBid, acceptLoading] = useAsyncTask(`acceptBid-${bid.id}`, e => toaster(e?.message));
  const userAddress = walletState.wallet?.addressInfo.byte20.toLowerCase();

  const isPendingTx = useMemo(() => {
    for (const pendingTx of Object.values(pendingTxs)) {
      if (pendingTx.chequeHash === bid.chequeHash)
        return true;
    }

    return false;
  }, [pendingTxs, bid])

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

  const getCardContent = (bid: Cheque, isInitial: boolean) => {
    const status = getChequeStatus(bid, currentBlock)
    const expiryTime = blockTime.add(15 * (bid.expiry - currentBlock), 'seconds')
    const priceToken = tokenState.tokens[toBech32Address(bid.price.address)]
    if (!priceToken) return null
    const priceAmount = new BigNumber(bid.price.amount).shiftedBy(-priceToken.decimals)
    const usdValue = valueCalculators.amount(tokenState.prices, priceToken, priceAmount)

    return (
      <CardContent>
        {
          showItem &&
          <MenuItem className={classes.item} button={false}>
            <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
              <ListItemIcon>
                <Avatar alt="NFT Image" src={bid.token.asset.url} />
              </ListItemIcon>
              {
                isInitial &&
                <Box>
                  <Typography>#{bid.token.tokenId}</Typography>
                </Box>
              }
            </Box>
          </MenuItem>
        }
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Date</Typography>
          <Typography>{dayjs(bid.createdAt).format("D MMM YYYY")}</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Amount</Typography>
          <Typography>
            <strong className={classes.amount}>
              {priceAmount.toFormat(priceAmount.gte(1) ? 2 : priceToken.decimals)}
            </strong> {priceToken.symbol} (${usdValue.toFormat(2)})
          </Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Versus Floor</Typography>
          <Typography>NYI</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>{bid.side === 'buy' ? "Buyer" : "Seller"}</Typography>
          <Typography>{bid.initiator?.username || truncateAddress(bid.initiatorAddress)}</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Expiration</Typography>
          <Typography className={classes.dateText}>{expiryTime.format("D MMM YYYY HH:mm:ss")}</Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between">
          <Typography className={classes.header}>Status</Typography>
          <Typography className={(status === 'Expired' || status === 'Cancelled') ? classes.red : classes.green}>
            {status}
          </Typography>
        </Box>
        {status === 'Active' && bid.initiatorAddress === userAddress &&
          <Box mt={2} display="flex" justifyContent="center">
            <Box flexGrow={1}>
              <FancyButton variant="contained" fullWidth loading={cancelLoading || isPendingTx} onClick={() => cancelBid(bid)} className={classes.actionButton}>
                <Typography className={classes.buttonText}>Cancel</Typography>
              </FancyButton>
            </Box>
          </Box>
        }
        {status === 'Active' && bid.token.ownerAddress === userAddress &&
          <Box mt={2} display="flex" justifyContent="center">
            <Box flexGrow={1}>
              <FancyButton variant="contained" fullWidth loading={acceptLoading || isPendingTx} onClick={() => acceptBid(bid)} className={classes.actionButton}>
                <Typography className={classes.buttonText}>Accept</Typography>
              </FancyButton>
            </Box>
          </Box>
        }
      </CardContent>
    )
  }

  return (
    <Card className={classes.root}>
      <ArkBox variant="base">
        {getCardContent(bid, true)}
        <Collapse in={expand}>
          {relatedBids?.map((bids) => (
            <>
              <Box paddingLeft={2} paddingRight={2}>
                <Box className={classes.topBorder}></Box>
              </Box>
              {getCardContent(bids, false)}
            </>
          ))}
        </Collapse>
        {!!(relatedBids?.length) && (
          <Box className={classes.actionArea}>
            <IconButton
              aria-label="expand row"
              size="medium"
              onClick={() => setExpand(!expand)}
              className={classes.arrowIcon}
            >
              {expand ? <UpArrow /> : <DownArrow />}
            </IconButton>
          </Box>
        )}
      </ArkBox>
    </Card>
  );
};

export default BidCard;
