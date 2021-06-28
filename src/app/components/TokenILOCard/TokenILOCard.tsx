import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { ZiloAppState } from 'zilswap-sdk/lib/zilo';
import { Box, Link, CircularProgress, Typography, makeStyles } from '@material-ui/core'
import { fromBech32Address } from "@zilliqa-js/crypto";
import { CurrencyInputILO, FancyButton, Text } from 'app/components'
import ProgressBar from 'app/components/ProgressBar'
import { actions } from "app/store";
import { RootState, TokenState, TransactionState, WalletObservedTx, WalletState } from "app/store/types"
import { useAsyncTask, useNetwork, useToaster } from "app/utils"
import { ZIL_ADDRESS } from 'app/utils/constants';
import { ZilswapConnector } from "core/zilswap";
import { ILOData, BLOCKS_PER_MINUTE } from 'core/zilo/constants';
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';

import HelpInfo from "../HelpInfo";
import { Dayjs } from 'dayjs';
import { ILOState } from 'zilswap-sdk/lib/constants';
import { ObservedTx } from 'zilswap-sdk';
import { AppTheme } from 'app/theme/types';
import cls from "classnames";
import { toHumanNumber } from 'app/utils/strings/strings';

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
  description: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 14
  },
  title: {
    fontWeight: 700,
    marginTop: theme.spacing(3),
  },
  meta: {
    fontFamily: "'Raleway', sans-serif",
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
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  viewIcon: {
    color: theme.palette.primary.dark,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-12px",
    marginTop: "-18px"
  },
  label: {
    color: theme.palette.label
  },
  link: {
    fontWeight: 600,
    color: theme.palette.text?.secondary,
    marginTop: theme.spacing(0.5),
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    verticalAlign: "top",
    "& path": {
      fill: theme.palette.text?.secondary,
    }
  },
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

  const zilToken = tokenState.tokens[ZIL_ADDRESS]
  const unitlessInAmount = new BigNumber(formState.zwapAmount).shiftedBy(zwapToken.decimals).integerValue();
  const approved = new BigNumber(zwapToken.allowances![contractAddrHex] || '0')
  const showTxApprove = approved.isZero() || approved.comparedTo(unitlessInAmount) < 0;
  const txIsPending = txIsSending || txState.observingTxs.findIndex(tx => tx.hash.toLowerCase() === pendingTxHash) >= 0

  const { state: iloState, contributed, userContribution, contractState: { total_contributions: totalContributionStr } } = ziloState
  const { target_zil_amount: targetZil, target_zwap_amount: targetZwap, token_amount: tokenAmount } = ziloState.contractInit!
  const { start_block: startBlock, end_block: endBlock } = ziloState.contractInit!
  // const contributed = true
  // const userContribution = new BigNumber('12345678912300000')
  // const targetZil = new BigNumber('70000').shiftedBy(12)
  // const targetZwap = new BigNumber('30000').shiftedBy(12)
  // console.log(targetZil.toString(), targetZwap.toString())

  const totalContributions = new BigNumber(totalContributionStr)
  const totalCommittedUSD = totalContributions.shiftedBy(-12).dividedBy(data.usdRatio).times(tokenState.prices.ZIL).toFormat(2)
  const progress = totalContributions.dividedBy(targetZil).times(100).integerValue()
  const iloStarted = iloState === ILOState.Active
  const iloOver = iloState === ILOState.Failed || iloState === ILOState.Completed
  const startTime = blockTime.add((startBlock - currentBlock) / BLOCKS_PER_MINUTE, 'minute')
  const endTime = blockTime.add((endBlock - currentBlock) / BLOCKS_PER_MINUTE, 'minute')
  const secondsToNextPhase = currentTime.isAfter(startTime) ? (currentTime.isAfter(endTime) || !iloStarted ? 0 : endTime.diff(currentTime, 'second')) : startTime.diff(currentTime, 'second')
  const blocksToNextPhase = currentTime.isAfter(startTime) ? (currentTime.isAfter(endTime) || !iloStarted ? 0 : endBlock - currentBlock) : startBlock - currentBlock
  const effectiveContribution = totalContributions.gt(targetZil) ? userContribution.times(targetZil).dividedToIntegerBy(totalContributions) : userContribution
  const effectiveTotalContributions = BigNumber.min(targetZil, totalContributions)
  const receiveAmount = effectiveContribution.times(tokenAmount).dividedToIntegerBy(effectiveTotalContributions)
  const refundZil = BigNumber.max(userContribution.minus(effectiveContribution.plus(1)), new BigNumber(0))
  const refundZwap = BigNumber.max(refundZil.times(targetZwap).dividedToIntegerBy(targetZil).minus(1), new BigNumber(0))

  const onZwapChange = (amount: string = "0") => {
    const _amount = new BigNumber(amount).shiftedBy(12).integerValue(BigNumber.ROUND_DOWN);
    const _zilAmount = _amount.minus(1).times(targetZil).dividedBy(targetZwap).integerValue(BigNumber.ROUND_DOWN);

    setFormState({
      ...formState,
      zwapAmount: _amount.shiftedBy(-12).toString(),
      zilAmount: _zilAmount.shiftedBy(-12).toString(),
    });
  };

  const onZilChange = (amount: string = "0") => {
    const _amount = new BigNumber(amount).shiftedBy(12).integerValue(BigNumber.ROUND_DOWN);
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
      setTxError(new Error('Committed amount must be more than 0'));
      return
    }

    if (amount.plus(userContribution).gt(targetZil)) {
      setTxError(new Error(`Maximum commit amount per wallet address is ${targetZil.shiftedBy(-12).toFormat(0)} ZIL`));
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
            <Text variant="h1" className={cls(classes.title, classes.meta)}>{data.tokenName} ({data.tokenSymbol})</Text>
            <Text marginTop={2} marginBottom={0.75} className={classes.description}>{data.description}</Text>
            {!!data.projectURL && (
              <Link
                className={classes.link}
                underline="none"
                rel="noopener noreferrer"
                target="_blank"
                href={data.projectURL}>
                Learn more about this token <NewLinkIcon className={classes.linkIcon} />
              </Link>
            )}

            {currentBlock > 0 && (
              <Text variant="h1" marginTop={2.75} className={classes.timer}>
                {
                  Math.floor(secondsToNextPhase / 3600).toLocaleString('en-US', { minimumIntegerDigits: 2 })}h : {
                  (Math.floor(secondsToNextPhase / 60) % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}m : {
                  (secondsToNextPhase % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}s
                <HelpInfo placement="top" title={`${blocksToNextPhase} blocks left to the ${currentTime.isAfter(startTime) ? 'end' : 'start'} of this ZILO. Countdown is an estimate only. This ZILO runs from block ${startBlock} to ${endBlock}.`} />
              </Text>
            )}

            <ProgressBar progress={progress.toNumber()} marginTop={3} />

            <Box marginTop={1} marginBottom={0.5}>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">Total Committed</Text>
                <Text className={classes.label}>~${totalCommittedUSD} ({progress.toString()}%)</Text>
              </Box>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left"><strong>Total Target</strong></Text>
                <Text className={classes.label}><strong>{data.usdTarget}</strong></Text>
              </Box>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">&nbsp; • &nbsp; ZIL to Raise</Text>
                <Text className={classes.label}>{targetZil.shiftedBy(-12).toFormat(0)}</Text>
              </Box>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">&nbsp; • &nbsp; ZWAP to Burn</Text>
                <Text className={classes.label}>{targetZwap.shiftedBy(-12).toFormat(0)}</Text>
              </Box>
            </Box>

            {
              !iloOver &&
              <Box position="relative">
                <Text className={cls(classes.title, classes.description)} marginBottom={0.75}>Commit your tokens in a fixed ratio to participate.</Text>
                <Text className={classes.description} color="textSecondary">{new BigNumber(1).minus(data.usdRatio).times(100).toFormat(0)}% ZWAP - {new BigNumber(data.usdRatio).times(100).toFormat(0)}% ZIL</Text>
                <Box marginTop={1.5} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12}>
                  <CurrencyInputILO
                    label="to Burn:"
                    token={zwapToken}
                    amount={formState.zwapAmount}
                    hideBalance={false}
                    onAmountChange={onZwapChange}
                  />
                  <ViewHeadlineIcon className={classes.viewIcon} />
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
            (iloStarted || contributed) &&
            <Box display="flex" flexDirection="column" alignItems="stretch" className={classes.meta} position="relative">
              <Text className={cls(classes.title, classes.description)}>Tokens Committed</Text>
              <Box marginTop={1.5} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12}>
                <CurrencyInputILO
                  label="to Burn:"
                  token={zwapToken}
                  amount={contributed ? toHumanNumber(userContribution.times(targetZwap).dividedToIntegerBy(targetZil).plus(1).shiftedBy(-12), 6) : '-'}
                  hideBalance={true}
                  disabled={true}
                  disabledStyle={contributed ? "strong" : "muted"}
                />
                <ViewHeadlineIcon className={classes.viewIcon} />
                <CurrencyInputILO
                  label="for Project:"
                  token={zilToken}
                  amount={contributed ? toHumanNumber(userContribution.shiftedBy(-12), 2) : '-'}
                  hideBalance={true}
                  disabled={true}
                  disabledStyle={contributed ? "strong" : "muted"}
                />
              </Box>
              {
                iloOver &&
                <Box marginTop={1} marginBottom={0.5}>
                  <Box display="flex" marginTop={0.5}>
                    <Text className={classes.label} flexGrow={1} align="left"><strong>ZWAP</strong> to Refund</Text>
                    <Text className={classes.label}>{refundZwap.shiftedBy(-12).toFormat(4)}</Text>
                  </Box>
                  <Box display="flex" marginTop={0.5}>
                    <Text className={classes.label} flexGrow={1} align="left"><strong>ZIL</strong> to Refund</Text>
                    <Text className={classes.label}>{refundZil.shiftedBy(-12).toFormat(4)}</Text>
                  </Box>
                  <Box display="flex" marginTop={0.5}>
                    <Text className={classes.label} flexGrow={1} align="left"><strong>{data.tokenSymbol}</strong> to Claim</Text>
                    <Text className={classes.label}>{contributed ? receiveAmount.shiftedBy(-data.tokenDecimals).toFormat(4) : '0.0000'}</Text>
                  </Box>
                </Box>
              }
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
              {contributed && iloState === ILOState.Completed && <Text className={classes.label} align="center">You'll be refunded any excess tokens in your claim transaction.</Text>}
              <Typography className={classes.errorMessage} color="error">{txError?.message}</Typography>
            </Box>
          }

        </Box>
      }
    </Box>
  )
}

export default TokenILOCard
