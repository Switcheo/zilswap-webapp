import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { ZiloAppState } from 'zilswap-sdk/lib/zilo';
import {
  Box,
  CircularProgress,
  Link,
  Typography,
  makeStyles,
  Divider,
} from '@material-ui/core';
import { fromBech32Address } from '@zilliqa-js/crypto';
import { Dayjs } from 'dayjs';
import { ILOState } from 'zilswap-sdk/lib/constants';
import { ObservedTx } from 'zilswap-sdk';
import cls from 'classnames';
import { getBlocksPerMinute, ILOData } from 'core/zilo/constants';
import { ZilswapConnector } from 'core/zilswap';
import {
  FancyButton,
  Text,
  CurrencyInput,
  ProportionSelect,
  CurrencyLogo,
} from 'app/components';
import ProgressBar from 'app/components/ProgressBar';
import { actions } from 'app/store';
import {
  RootState,
  TokenState,
  TransactionState,
  WalletObservedTx,
  WalletState,
} from 'app/store/types';
import { BIG_ZERO, bnOrZero, useAsyncTask, useNetwork, useToaster } from 'app/utils';
import { ZIL_ADDRESS } from 'app/utils/constants';
import { ReactComponent as NewLinkIcon } from 'app/components/new_link.svg';

import { AppTheme } from 'app/theme/types';
import HelpInfo from '../HelpInfo';
import WhitelistBadge from './WhitelistBadge';

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    paddingBottom: theme.spacing(2.5),
    // "& .MuiBox-root": {
    //   flex: 1
    // }
  },
  container: {
    padding: theme.spacing(4, 4, 0),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 2, 0),
    },
  },
  description: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: 14,
    lineHeight: 1.2,
  },
  titleContainer: {
    marginTop: theme.spacing(3),
  },
  title: {
    fontWeight: 700,
  },
  meta: {
    fontFamily: "'Raleway', sans-serif",
    textAlign: 'center',
  },
  svg: {
    maxWidth: '100%',
    width: 'unset',
    height: 'unset',
    flex: 1,
    borderRadius: '12px 12px 0 0',
  },
  actionButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    height: 46,
  },
  expandButton: {
    background: 'none',
    border: 'none',
  },
  timer: {
    color: theme.palette.primary.dark,
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  },
  viewIcon: {
    color: theme.palette.primary.dark,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: '-12px',
    transform: 'translateY(-50%)',
  },
  label: {
    color: theme.palette.label,
    fontWeight: 400,
    fontSize: '14px',
  },
  highlight: {
    fontSize: '14px',
    color: theme.palette.type === 'dark' ? '#00FFB0' : '#003340',
    fontWeight: 400,
  },
  link: {
    fontWeight: 600,
    color: theme.palette.text?.secondary,
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
  },
  linkIcon: {
    marginLeft: theme.spacing(0.5),
    display: 'inline-block',
    verticalAlign: 'top',
    width: '14px',
    height: '14px',
    '& path': {
      fill: theme.palette.text?.secondary,
    },
  },
  divider: {
    border: theme.palette.border,
    margin: theme.spacing(3, 0),
  },
  proportionSelect: {
    marginTop: 3,
    marginBottom: 4,
  },
  committedBox: {
    backgroundColor: 'rgba(222, 255, 255, 0.1)',
    border: '3px solid rgba(0, 255, 176, 0.2)',
    borderRadius: 12,
  },
  committedBoxLabel: {
    fontSize: '24px',
    lineHeight: 1.4,
    marginLeft: theme.spacing(1),
  },
  committedBoxAmount: {
    fontSize: '24px',
    color: theme.palette.primary.dark,
  },
}));

interface Props {
  expanded?: boolean;
  data: ILOData;
  blockTime: Dayjs;
  currentBlock: number;
  currentTime: Dayjs;
}

const initialFormState = {
  zilAmount: '0',
};

const TokenILOCard = (props: Props) => {
  const { data, currentBlock, currentTime, blockTime, expanded = true } = props;
  const contractAddrHex = fromBech32Address(data.contractAddress).toLowerCase();
  const dispatch = useDispatch();
  const network = useNetwork();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const txState = useSelector<RootState, TransactionState>(state => state.transaction);
  const ziloState = useSelector<RootState, ZiloAppState>(
    state => state.blockchain.contracts.zilo[contractAddrHex]
  );
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);
  const [runTx, txIsSending, txError, setTxError] = useAsyncTask('pendingTx');
  const classes = useStyles();
  const toaster = useToaster();

  const blocksPerMinute = useMemo(() => getBlocksPerMinute(network), [network]);
  const [zwapToken] = Object.values(tokenState.tokens).filter(token => token.isZwap);
  const zilToken = tokenState.tokens[ZIL_ADDRESS];

  const insufficientBalanceError = useMemo(() => {
    // not initialized
    if (!zilToken) return null;

    // check zil balance
    const zilAmount = bnOrZero(formState.zilAmount)
      .shiftedBy(zilToken.decimals)
      .integerValue();
    if (zilAmount.isZero()) return 'Enter amount to commit';
    if (zilAmount.gt(zilToken.balance ?? BIG_ZERO)) return 'Insufficient ZIL Balance';

    // balance is sufficient
    return null;
  }, [zilToken, formState]);

  if (!zwapToken || !ziloState) {
    return (
      <Box
        display="flex"
        padding={3}
        flex={1}
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress color="primary" size={38} />
      </Box>
    );
  }

  const txIsPending =
    txIsSending ||
    txState.observingTxs.findIndex(tx => tx.hash.toLowerCase() === pendingTxHash) >= 0;

  const {
    state: iloState,
    contributed,
    userContribution,
    contractState: {
      total_contributions: totalContributionStr,
      discount_whitelist: discountWhitelist,
      balances,
    },
  } = ziloState;
  const {
    target_zil_amount: targetZil,
    token_amount: tokenAmount,
    minimum_zil_amount: minZilAmount,
  } = ziloState.contractInit!;
  const { start_block: startBlock, end_block: endBlock } = ziloState.contractInit!;

  const successThreshold = minZilAmount.div(targetZil).times(100).dp(0).toNumber();
  console.log(successThreshold);

  let userSent = new BigNumber(0);
  let isWhitelisted = false;
  if (walletState.wallet) {
    const userAddress = walletState.wallet.addressInfo.byte20.toLowerCase();
    // get sent zil amount
    if (userAddress in balances!) {
      userSent = balances![userAddress];
    }
    // check whitelist
    if (userAddress in discountWhitelist!) {
      isWhitelisted = true;
    }
  }

  const totalContributions = new BigNumber(totalContributionStr);
  const totalCommittedUSD = totalContributions
    .shiftedBy(-12)
    .dividedBy(data.usdRatio)
    .times(tokenState.prices[ZIL_ADDRESS]);

  const contributionRate = totalContributions.dividedBy(targetZil);
  const progress = contributionRate.times(100).integerValue();
  const iloStarted = iloState === ILOState.Active;
  const iloOver = iloState === ILOState.Failed || iloState === ILOState.Completed;
  const startTime = blockTime.add(
    (startBlock - currentBlock) / blocksPerMinute,
    'minute'
  );
  const endTime = blockTime.add((endBlock - currentBlock) / blocksPerMinute, 'minute');
  const secondsToNextPhase = currentTime.isAfter(startTime)
    ? currentTime.isAfter(endTime) || !iloStarted
      ? 0
      : endTime.diff(currentTime, 'second')
    : startTime.diff(currentTime, 'second');
  const blocksToNextPhase = currentTime.isAfter(startTime)
    ? currentTime.isAfter(endTime) || !iloStarted
      ? 0
      : endBlock - currentBlock
    : startBlock - currentBlock;
  const effectiveContribution = totalContributions.gt(targetZil)
    ? userContribution.times(targetZil).dividedToIntegerBy(totalContributions)
    : userContribution;
  const effectiveTotalContributions = BigNumber.min(targetZil, totalContributions);
  const receiveAmount = effectiveContribution
    .times(tokenAmount.times(contributionRate))
    .dividedToIntegerBy(effectiveTotalContributions);
  const refundZil = BigNumber.max(
    userContribution.minus(effectiveContribution.plus(1)),
    new BigNumber(0)
  );

  /* User contribution summary */
  const fundUSD = new BigNumber(formState.zilAmount).times(
    tokenState.prices[ZIL_ADDRESS]
  );
  const discount =
    isWhitelisted && data.whitelistDiscountPercent ? data.whitelistDiscountPercent : 0;
  const discountUSD = fundUSD.div(95).times(discount);
  const receiveUSD = fundUSD.plus(discountUSD);

  const formatUSDValue = (value: BigNumber): string => {
    if (value.isZero()) return '-';
    if (value.isNaN()) return '-';
    return `$${value.toFormat(2)}`;
  };

  const onZilChange = (amount: string = '0') => {
    const _amount = new BigNumber(amount)
      .shiftedBy(12)
      .integerValue(BigNumber.ROUND_DOWN);

    setFormState({
      ...formState,
      zilAmount: _amount.shiftedBy(-12).toString(),
    });
  };

  const onPercentage = (percentage: number) => {
    const balance = bnOrZero(zilToken.balance);
    const intendedAmount = balance.times(percentage).decimalPlaces(0);
    const netGasAmount = ZilswapConnector.adjustedForGas(intendedAmount, balance);
    setFormState({
      ...formState,
      zilAmount: netGasAmount.shiftedBy(-12).toString(),
    });
  };

  const onCommit = () => {
    if (txIsPending) return;

    const amount = new BigNumber(formState.zilAmount).shiftedBy(12).integerValue();
    if (amount.lte(0) || amount.isNaN()) {
      setTxError(new Error('Committed amount must be more than 0'));
      return;
    }

    if (amount.plus(userContribution).gt(targetZil)) {
      setTxError(
        new Error(
          `Maximum commit amount per wallet address is ${targetZil
            .shiftedBy(-12)
            .toFormat(0)} ZIL`
        )
      );
      return;
    }

    runTx(async () => {
      const observedTx = await ZilswapConnector.contributeZILO({
        address: data.contractAddress,
        amount,
      });

      if (!observedTx) throw new Error('Failed to commit tokens');

      onSentTx(observedTx);
    });
  };

  const onClaim = () => {
    if (txIsPending || !contributed) return;

    runTx(async () => {
      const observedTx = await ZilswapConnector.claimZILO({
        address: data.contractAddress,
      });

      if (!observedTx) throw new Error('Failed to commit tokens');

      onSentTx(observedTx);
    });
  };

  const onSentTx = (tx: ObservedTx) => {
    const walletObservedTx: WalletObservedTx = {
      ...tx!,
      address: walletState.wallet!.addressInfo.bech32,
      network,
    };

    setPendingTxHash(tx.hash.toLowerCase());
    toaster('Sent', { hash: walletObservedTx.hash });
    dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
  };

  return (
    <Box className={classes.root}>
      <Box>
        <button className={classes.expandButton}>
          <img className={classes.svg} src={data.imageURL} alt={data.tokenName} />
        </button>
      </Box>
      {expanded && (
        <Box display="flex" flexDirection="column" className={classes.container}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            className={classes.meta}
          >
            <WhitelistBadge
              whitelisted={isWhitelisted}
              discount={data.whitelistDiscountPercent ? data.whitelistDiscountPercent : 0}
              minZwap={data.minZwap ? data.minZwap : 0}
            />

            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              className={classes.titleContainer}
            >
              <Text variant="h1" className={cls(classes.title, classes.meta)}>
                {data.tokenName} ({data.tokenSymbol})
              </Text>
              {!!data.projectURL && (
                <Link
                  className={classes.link}
                  underline="none"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={data.projectURL}
                >
                  <NewLinkIcon className={classes.linkIcon} />
                </Link>
              )}
            </Box>
            <Text marginTop={2} marginBottom={0.75} className={classes.description}>
              {data.description}
            </Text>

            {currentBlock > 0 && (
              <Text variant="h1" marginTop={2.75} className={classes.timer}>
                {Math.floor(secondsToNextPhase / 3600).toLocaleString('en-US', {
                  minimumIntegerDigits: 2,
                })}
                :
                {(Math.floor(secondsToNextPhase / 60) % 60).toLocaleString('en-US', {
                  minimumIntegerDigits: 2,
                })}
                :
                {(secondsToNextPhase % 60).toLocaleString('en-US', {
                  minimumIntegerDigits: 2,
                })}
                <HelpInfo
                  placement="top"
                  title={`${blocksToNextPhase} blocks left to the ${
                    currentTime.isAfter(startTime) ? 'end' : 'start'
                  } of this ZILO. Countdown is an estimate only. This ZILO runs from block ${startBlock} to ${endBlock}.`}
                />
              </Text>
            )}

            <ProgressBar
              progress={progress.toNumber()}
              marginTop={3}
              threshold={successThreshold}
            />

            <Box marginTop={1} marginBottom={0.5}>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">
                  Total Committed
                </Text>
                <Text className={classes.label}>
                  ~{formatUSDValue(totalCommittedUSD)} ({progress.toString()}%)
                </Text>
              </Box>
              <Box display="flex" marginTop={0.75}>
                <Text className={classes.label} flexGrow={1} align="left">
                  Target
                </Text>
                <Text className={classes.label}>{data.usdTarget}</Text>
              </Box>
            </Box>

            <Divider className={classes.divider} />

            {!iloOver && (
              <Box>
                <Box
                  display="flex"
                  bgcolor="background.contrast"
                  padding={0.5}
                  borderRadius={12}
                  position="relative"
                >
                  <CurrencyInput
                    label="Amount"
                    token={zilToken}
                    amount={formState.zilAmount}
                    // disabled={!inToken}
                    fixedToken={true}
                    onAmountChange={onZilChange}
                  />
                </Box>
                <Box display="flex" justifyContent="flex-end">
                  <ProportionSelect
                    size="small"
                    className={classes.proportionSelect}
                    onSelectProp={onPercentage}
                  />
                </Box>

                <Box marginTop={1} marginBottom={0.5}>
                  <Box display="flex" marginTop={0.75}>
                    <Text className={classes.label} flexGrow={1} align="left">
                      Cost
                    </Text>
                    <Text className={classes.label}>{formatUSDValue(fundUSD)}</Text>
                  </Box>
                  <Box display="flex" marginTop={0.75}>
                    <Text className={classes.label} flexGrow={1} align="left">
                      <>
                        Whitelist Discount{' '}
                        {isWhitelisted ? `(${data.whitelistDiscountPercent}%)` : ''}
                      </>
                    </Text>
                    <Text className={classes.label}>{formatUSDValue(discountUSD)}</Text>
                  </Box>
                  <Box display="flex" marginTop={0.75}>
                    <Text className={cls(classes.highlight)} flexGrow={1} align="left">
                      Amount to Commit & Receive
                    </Text>
                    <Text className={classes.highlight}>
                      {formatUSDValue(receiveUSD)}
                    </Text>
                  </Box>
                </Box>

                <FancyButton
                  walletRequired
                  className={classes.actionButton}
                  disabled={!iloStarted || !!insufficientBalanceError}
                  variant="contained"
                  color="primary"
                  onClick={onCommit}
                >
                  {!!iloStarted
                    ? insufficientBalanceError ?? 'Commit'
                    : currentTime.isAfter(startTime)
                    ? 'Waiting for start block...'
                    : 'Waiting to begin...'}
                </FancyButton>
                <Typography className={classes.errorMessage} color="error">
                  {txError?.message}
                </Typography>
                <Divider className={classes.divider} />
                <Box display="flex" marginTop={0.75}>
                  <Text className={classes.label} flexGrow={1} align="center">
                    Your Committed Amount
                  </Text>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  className={classes.committedBox}
                  paddingX={2}
                  paddingY={2}
                  marginTop={2}
                  alignItems="center"
                >
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CurrencyLogo currency={zilToken.symbol} />
                    <Text className={classes.committedBoxLabel}>ZIL</Text>
                  </Box>
                  <Text className={classes.committedBoxAmount}>
                    {contributed ? userSent.shiftedBy(-12).toFormat(2) : '-'}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          {(iloStarted || contributed) && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="stretch"
              className={classes.meta}
            >
              {iloOver && (
                <Box marginTop={1} marginBottom={0.5}>
                  <Box display="flex" marginTop={0.5}>
                    <Text className={classes.label} flexGrow={1} align="left">
                      <strong>ZIL</strong> to Refund
                    </Text>
                    <Text className={classes.label}>
                      {refundZil.shiftedBy(-12).toFormat(4)}
                    </Text>
                  </Box>
                  <Box display="flex" marginTop={0.5}>
                    <Text className={classes.label} flexGrow={1} align="left">
                      <strong>{data.tokenSymbol}</strong> to Claim
                    </Text>
                    <Text className={classes.label}>
                      {contributed
                        ? receiveAmount.shiftedBy(-data.tokenDecimals).toFormat(4)
                        : '0.0000'}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {iloOver && (
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
                {contributed
                  ? iloState === ILOState.Completed
                    ? 'Claim'
                    : 'Refund'
                  : 'Completed'}
              </FancyButton>
              {contributed && iloState === ILOState.Completed && (
                <Text className={classes.label} align="center">
                  You'll be refunded any excess tokens in your claim transaction.
                </Text>
              )}
              <Typography className={classes.errorMessage} color="error">
                {txError?.message}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TokenILOCard;
