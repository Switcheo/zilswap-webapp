import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { ZiloAppState } from 'zilswap-sdk/lib/zilo';
import { Box, CircularProgress, Typography, makeStyles } from '@material-ui/core'
import { fromBech32Address } from "@zilliqa-js/crypto";
import { CurrencyInputILO, FancyButton, Text } from 'app/components'
import ProgressBar from 'app/components/ProgressBar'
import { actions } from "app/store";
import { RootState, TokenState, TransactionState, WalletObservedTx, WalletState } from "app/store/types"
import { useAsyncTask, useNetwork, useToaster } from "app/utils"
import { ZIL_TOKEN_NAME } from 'app/utils/constants';
import { ZilswapConnector } from "core/zilswap";
import { ILOData } from 'core/zilo/constants';
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';

import HelpInfo from "../HelpInfo";
import { Dayjs } from 'dayjs';
import { ILOState } from 'zilswap-sdk/lib/constants';
import { ObservedTx } from 'zilswap-sdk';
import { AppTheme } from 'app/theme/types';
import cls from "classnames";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    paddingBottom: theme.spacing(2.5),
    // "& .MuiBox-root": {
    //   flex: 1
    // }
  },
  container: {
    padding: theme.spacing(4, 4, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  meta: {
    textAlign: "center",
  },
  svg: {
    maxWidth: "100%",
    width: "unset",
    height: "unset",
    flex: 1,
    borderRadius: "12px 12px 0 0"
  },
  actionButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    height: 46
  },
  expandButton: {
    background: "none",
    border: "none"
  },
  timer: {
    color: theme.palette.primary.dark
  },
  title: {
    fontWeight: 700,
    marginTop: theme.spacing(3),
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  viewIcon: {
    color: theme.palette.primary.dark,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-12px",
    marginTop: "12px"
  },
  label: {
    color: theme.palette.label
  },
  fontSize: {
    fontSize: 14
  }
}));

interface Props {
  expanded?: boolean
  data: ILOData
  blockTime: Dayjs
  currentBlock: number
  currentTime: Dayjs
};

const initialFormState = {
  zwapAmount: "0",
  zilAmount: "0",
};

const TokenILOCard = (props: Props) => {
  const { data, currentBlock, currentTime, blockTime, expanded = true } = props;
  const contractAddrHex = fromBech32Address(data.contractAddress).toLowerCase();
  const dispatch = useDispatch();
  const network = useNetwork();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const txState = useSelector<RootState, TransactionState>(state => state.transaction);
  const ziloState = useSelector<RootState, ZiloAppState>(state => state.blockchain.contracts.zilo[contractAddrHex]);
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null)
  const [runTx, txIsSending, txError, setTxError] = useAsyncTask("pendingTx");
  const classes = useStyles();
  const toaster = useToaster();

  const zwapToken = Object.values(tokenState.tokens).filter(token => token.isZwap)[0]

  if (!zwapToken || !ziloState) {
    return <Box display="flex" padding={3} flex={1} alignItems="center" justifyContent="center">
      <CircularProgress color="primary" size={38} />
    </Box>
  }

  const zilToken = tokenState.tokens[ZIL_TOKEN_NAME]
  const unitlessInAmount = new BigNumber(formState.zwapAmount).shiftedBy(zwapToken.decimals).integerValue();
  const approved = new BigNumber(zwapToken.allowances![contractAddrHex] || '0')
  const showTxApprove = approved.isZero() || approved.comparedTo(unitlessInAmount) < 0;
  const txIsPending = txIsSending || txState.observingTxs.findIndex(tx => tx.hash.toLowerCase() === pendingTxHash) >= 0

  const { state: iloState, contributed, userContribution, contractState: { total_contributions: totalContributions } } = ziloState
  const { target_zil_amount: targetZil, target_zwap_amount: targetZwap } = ziloState.contractInit!
  const { start_block: startBlock, end_block: endBlock } = ziloState.contractInit!
  // const targetZil = new BigNumber('70000').shiftedBy(12)
  // const targetZwap = new BigNumber('30000').shiftedBy(12)
  // console.log(targetZil.toString(), targetZwap.toString())

  const totalCommittedUSD = new BigNumber(totalContributions).shiftedBy(-12).dividedBy(data.usdRatio).times(tokenState.prices.ZIL).toFormat(2)
  const progress = new BigNumber(totalContributions).dividedBy(targetZil).times(100).integerValue()
  const iloStarted = iloState === ILOState.Active
  const iloOver = iloState === ILOState.Failed || iloState === ILOState.Completed
  const startTime = blockTime.add((startBlock - currentBlock), 'minute')
  const endTime = blockTime.add((endBlock - currentBlock), 'minute')
  const secondsToNextPhase = currentTime.isAfter(startTime) ? (currentTime.isAfter(endTime) || !iloStarted ? 0 : endTime.diff(currentTime, 'second')) : startTime.diff(currentTime, 'second')

  const onZwapChange = (amount: string = "0") => {
    const _amount = new BigNumber(amount).shiftedBy(12).integerValue(BigNumber.ROUND_DOWN);
    const _zilAmount = _amount.minus(1).times(targetZil).dividedBy(targetZwap).integerValue(BigNumber.ROUND_DOWN);
    if (_zilAmount.gt(targetZil)) {
      onZilChange(targetZil.shiftedBy(-12).toString())
      return
    }

    setFormState({
      ...formState,
      zwapAmount: _amount.shiftedBy(-12).toString(),
      zilAmount: _zilAmount.shiftedBy(-12).toString(),
    });
  };

  const onZilChange = (amount: string = "0") => {
    const _amount = BigNumber.min(targetZil, new BigNumber(amount).shiftedBy(12).integerValue(BigNumber.ROUND_DOWN));
    const _zwapAmount = _amount.times(targetZwap).dividedToIntegerBy(targetZil).plus(1)

    setFormState({
      ...formState,
      zwapAmount: _zwapAmount.shiftedBy(-12).toString(),
      zilAmount: _amount.shiftedBy(-12).toString(),
    });
  };

  const onApprove = () => {
    if (txIsPending) return;

    runTx(async () => {
      const tokenAmount = new BigNumber(formState.zwapAmount).plus(1);
      const observedTx = await ZilswapConnector.approveTokenTransfer({
        tokenAmount: tokenAmount.shiftedBy(zwapToken.decimals),
        tokenID: zwapToken.address,
        spenderAddress: contractAddrHex,
      });

      if (!observedTx)
        throw new Error("Transfer allowance already sufficient for specified amount");

      onSentTx(observedTx);
    });
  };

  const onCommit = () => {
    if (txIsPending) return;

    const amount = new BigNumber(formState.zilAmount).shiftedBy(12).integerValue()
    if (amount.lte(0) || amount.isNaN()) {
      setTxError(new Error('Invalid contribution amount'));
      return
    }

    runTx(async () => {
      const observedTx = await ZilswapConnector.contributeZILO({
        address: data.contractAddress,
        amount,
      });

      if (!observedTx)
        throw new Error("Failed to commit tokens");

      onSentTx(observedTx);
    })
  }

  const onClaim = () => {
    if (txIsPending || !contributed) return;

    runTx(async () => {
      const observedTx = await ZilswapConnector.claimZILO({
        address: data.contractAddress,
      });

      if (!observedTx)
        throw new Error("Failed to commit tokens");

      onSentTx(observedTx);
    })
  }

  const onSentTx = (tx: ObservedTx) => {
    const walletObservedTx: WalletObservedTx = {
      ...tx!,
      address: walletState.wallet!.addressInfo.bech32,
      network,
    };

    setPendingTxHash(tx.hash.toLowerCase());
    toaster("Sent", { hash: walletObservedTx.hash });
    dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
  }

  return (
    <Box className={classes.root}>
      <Box>
        <button className={classes.expandButton}>
          <img
            className={classes.svg}
            src={data.imageURL}
            alt={data.tokenName}
          />
        </button>
      </Box>
      {expanded &&
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box display="flex" flexDirection="column" alignItems="stretch" className={classes.meta}>
            <Text variant="h1">{data.tokenName} ({data.tokenSymbol})</Text>
            <Text marginTop={1} className={classes.fontSize}>{data.description}</Text>

            <Text variant="h1" marginTop={2} className={classes.timer}>
              {/* {
                currentTime.isBefore(endTime) && '~'
              } */}
              {
                Math.floor(secondsToNextPhase / 3600).toLocaleString('en-US', { minimumIntegerDigits: 2 })}h : {
                (Math.floor(secondsToNextPhase / 60) % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}m : {
                (secondsToNextPhase % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}s
              <HelpInfo placement="top" title="Approximate time left. Exact start time is based on block height, not wall clock." />
            </Text>

            <ProgressBar progress={progress.toNumber()} marginTop={3} />

            <Box marginTop={1} marginBottom={0.5}>
              <Box display="flex" marginTop={0.5}>
                <Text className={classes.label} flexGrow={1} align="left">Total Committed</Text>
                <Text className={classes.label}>~${totalCommittedUSD} ({progress.toString()}%)</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text className={classes.label} flexGrow={1} align="left">ZIL to Raise</Text>
                <Text className={classes.label}>{targetZil.shiftedBy(-12).toFormat(0)}</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text className={classes.label} flexGrow={1} align="left">ZWAP to Burn</Text>
                <Text className={classes.label}>{targetZwap.shiftedBy(-12).toFormat(0)}</Text>
              </Box>
            </Box>

            {
              iloOver &&
              <Box>
                <Text className={cls(classes.title, classes.fontSize)} marginBottom={0.5}>Commit your tokens in a fixed ratio to participate.</Text>
                <Text className={classes.fontSize} color="textSecondary">30% ZWAP - 70% ZIL</Text>
                <Box marginTop={1.5} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12}>
                  <CurrencyInputILO
                    label="to Burn:"
                    token={zwapToken}
                    amount={formState.zwapAmount}
                    hideBalance={false}
                    onAmountChange={onZwapChange}
                  />
                  <CurrencyInputILO
                    label="for Project:"
                    token={zilToken}
                    amount={formState.zilAmount}
                    hideBalance={false}
                    onAmountChange={onZilChange}
                  />
                </Box>
                <FancyButton
                  walletRequired
                  className={classes.actionButton}
                  showTxApprove={showTxApprove}
                  loadingTxApprove={txIsPending}
                  onClickTxApprove={onApprove}
                  disabled={!showTxApprove && !iloStarted}
                  variant="contained"
                  color="primary"
                  onClick={onCommit}
                >
                  {iloStarted ? 'Commit' : (currentTime.isAfter(startTime) ? 'Waiting for start block...' : 'Waiting to begin')}
                </FancyButton>
                <Typography className={classes.errorMessage} color="error">{txError?.message}</Typography>
              </Box>
            }
          </Box>

          {
            iloStarted &&
            <Box display="flex" flexDirection="column" alignItems="stretch" className={classes.meta} position="relative">
              <Text className={classes.title}>Tokens Committed</Text>
              <Box marginTop={1.5} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12}>
                <CurrencyInputILO
                  label="to Burn:"
                  token={zwapToken}
                  amount={contributed ? userContribution.times(targetZwap).dividedToIntegerBy(targetZil).plus(1).shiftedBy(-12).toString() : '-'}
                  hideBalance={true}
                  disabled={true}
                  disabledStyle={contributed ? "strong" : "muted"}
                />
                <ViewHeadlineIcon className={classes.viewIcon} />
                <CurrencyInputILO
                  label="for Project:"
                  token={zilToken}
                  amount={contributed ? userContribution.shiftedBy(-12).toString() : '-'}
                  hideBalance={true}
                  disabled={true}
                  disabledStyle={contributed ? "strong" : "muted"}
                />
              </Box>
            </Box>
          }

          {
            iloOver &&
            <Box>
              <FancyButton
                walletRequired
                className={classes.actionButton}
                showTxApprove={false}
                disabled={txIsPending || !contributed}
                variant="contained"
                color="primary"
                onClick={onClaim}
              >
                {contributed ? (iloState === ILOState.Completed ? 'Claim' : 'Refund') : 'Completed'}
              </FancyButton>
              <Typography className={classes.errorMessage} color="error">{txError?.message}</Typography>
            </Box>
          }

        </Box>
      }
    </Box>
  )
}

export default TokenILOCard
