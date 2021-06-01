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
import { useAsyncTask, useNetwork } from "app/utils"
import { ZIL_TOKEN_NAME } from 'app/utils/constants';
import { ZilswapConnector } from "core/zilswap";
import { ILOData } from 'core/zilo/constants';
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';

import HelpInfo from "../HelpInfo";
import { Dayjs } from 'dayjs';
import { ILOState } from 'zilswap-sdk/lib/constants';

const useStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(2.5),
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
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null) // TODO: do this for all txs
  const [runCommit, loading, error, clearCommitError] = useAsyncTask("commitILO");
  const [runApprove, loadingApproveTx, errorApproveTx, clearApproveError] = useAsyncTask("approveTx");
  const classes = useStyles();

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
  const disableTxApprove = loadingApproveTx || txState.observingTxs.findIndex(tx => tx.hash.toLowerCase() === approveTxHash) > 0

  const { state: iloState, contributed, userContribution, contractState: { total_contributions: totalContributions } } = ziloState
  // const { target_zil_amount: targetZil, target_zwap_amount: targetZwap } = ziloState.contractInit!
  const { start_block: startBlock, end_block: endBlock } = ziloState.contractInit!
  const targetZil = new BigNumber('70000').shiftedBy(12)
  const targetZwap = new BigNumber('30000').shiftedBy(12)
  // console.log(targetZil.toString(), targetZwap.toString())

  const totalCommittedUSD = new BigNumber(totalContributions).shiftedBy(-12).dividedBy(data.usdRatio).times(tokenState.prices.ZIL).toFormat(2)
  const progress = new BigNumber(totalContributions).dividedBy(targetZil).times(100).integerValue()
  const startTime = blockTime.add((startBlock - currentBlock), 'minute')
  const endTime = blockTime.add((endBlock - currentBlock), 'minute')
  const secondsToNextPhase = currentTime.isAfter(startTime) ? (currentTime.isAfter(endTime) ? 0 : endTime.diff(currentTime, 'second')) : startTime.diff(currentTime, 'second')
  const iloStarted = blockTime.isAfter(startTime)
  const iloOver = iloState === ILOState.Failed || iloState === ILOState.Completed

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
    if (loading) return;

    clearCommitError();

    runApprove(async () => {
      const tokenAmount = new BigNumber(formState.zwapAmount).plus(1);
      const observedTx = await ZilswapConnector.approveTokenTransfer({
        tokenAmount: tokenAmount.shiftedBy(zwapToken.decimals),
        tokenID: zwapToken.address,
        spenderAddress: contractAddrHex,
      });

      if (!observedTx)
        throw new Error("Transfer allowance already sufficient for specified amount");

      const walletObservedTx: WalletObservedTx = {
        ...observedTx!,
        address: walletState.wallet!.addressInfo.bech32,
        network,
      };

      setApproveTxHash(observedTx.hash.toLowerCase());
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
    });
  };

  const onCommit = () => {
    if (loading) return;

    clearApproveError();

    runCommit(async () => {
    })
  }

  const onClaim = () => {
    if (loading) return;

    runCommit(async () => {
      // TODO: reusing same effect - is this ok?
    })
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
            <Text marginTop={1}>{data.description}</Text>

            <Text variant="h1" marginTop={2} className={classes.timer}>
              {
                currentTime.isBefore(endTime) && '~'
              }
              {
                Math.floor(secondsToNextPhase / 3600).toLocaleString('en-US', {minimumIntegerDigits: 2})}:{
                (Math.floor(secondsToNextPhase / 60) % 60).toLocaleString('en-US', {minimumIntegerDigits: 2})}:{
                (secondsToNextPhase % 60).toLocaleString('en-US', {minimumIntegerDigits: 2})
              }
              <HelpInfo placement="top" title="Approximate time left in HH:MM:SS." />
            </Text>

            <ProgressBar progress={progress.toNumber()} marginTop={3} />

            <Box marginTop={1} marginBottom={0.5}>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">Total Committed</Text>
                <Text color="textSecondary">~${totalCommittedUSD} ({progress.toString()}%)</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">ZIL to Raise</Text>
                <Text color="textSecondary">{targetZil.shiftedBy(-12).toFormat(12)}</Text>
              </Box>
              <Box display="flex" marginTop={0.5}>
                <Text color="textSecondary" flexGrow={1} align="left">ZWAP to Burn</Text>
                <Text color="textSecondary">{targetZwap.shiftedBy(-12).toFormat(12)}</Text>
              </Box>
            </Box>

            {
              !iloOver &&
              [
                <Text className={classes.title} marginBottom={0.5}>Contribute your tokens in a fixed ratio to participate</Text>,
                <Text color="textSecondary">30% ZWAP - 70% ZIL</Text>,
                <Box marginTop={1.5} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12}>
                  <CurrencyInputILO
                    label="to Burn:"
                    token={zwapToken}
                    amount={formState.zwapAmount}
                    hideBalance={false}
                    disabled={false}
                    onAmountChange={onZwapChange}
                  />

                  <CurrencyInputILO
                    label="for Project:"
                    token={zilToken}
                    amount={formState.zilAmount}
                    hideBalance={false}
                    disabled={false}
                    onAmountChange={onZilChange}
                  />
                </Box>,
                <FancyButton
                  walletRequired
                  className={classes.actionButton}
                  showTxApprove={showTxApprove}
                  loadingTxApprove={disableTxApprove}
                  onClickTxApprove={onApprove}
                  disabled={!showTxApprove && !iloStarted}
                  variant="contained"
                  color="primary"
                  onClick={onCommit}
                >
                  {iloStarted ? 'Contribute' : 'Waiting...'}
                </FancyButton>
              ]
            }
          </Box>

          {
            iloStarted &&
            <Box display="flex" flexDirection="column" alignItems="stretch" className={classes.meta} position="relative">
              <Text className={classes.title}>Tokens Contributed</Text>
              <Box marginTop={1.5} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12}>
                <CurrencyInputILO
                  label="to Burn:"
                  token={zwapToken}
                  amount={contributed ? userContribution.shiftedBy(12).times(targetZwap).dividedToIntegerBy(targetZil).plus(1).shiftedBy(-12).toString() : '-'}
                  hideBalance={true}
                  disabled={true}
                />
                <ViewHeadlineIcon className={classes.viewIcon}/>
                <CurrencyInputILO
                  label="for Project:"
                  token={zilToken}
                  amount={contributed ?  userContribution.shiftedBy(-12).toString() : '-'}
                  hideBalance={true}
                  disabled={true}
                />
              </Box>
            </Box>
          }

          {
            iloOver &&
            <FancyButton
              walletRequired
              className={classes.actionButton}
              showTxApprove={false}
              disabled={!contributed}
              variant="contained"
              color="primary"
              onClick={onClaim}
            >
              {contributed ? (iloState === ILOState.Completed ? 'Claim' : 'Refund') : 'Completed'}
            </FancyButton>
          }

          <Typography className={classes.errorMessage} color="error">{error?.message || errorApproveTx?.message}</Typography>
        </Box>
      }
    </Box>
  )
}

export default TokenILOCard
