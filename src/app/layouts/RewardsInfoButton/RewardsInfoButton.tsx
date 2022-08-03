import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Backdrop, Box, BoxProps, Button, Card, Checkbox, CircularProgress, ClickAwayListener, Divider, FormControlLabel, IconButton, Link, Popper, Tooltip } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import CheckBoxIcon from "@material-ui/icons/CheckBoxRounded";
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import IndeterminateCheckBoxIcon from "@material-ui/icons/IndeterminateCheckBoxRounded";
import ErrorIcon from '@material-ui/icons/ErrorOutlineOutlined';
import BigNumber from "bignumber.js";
import cls from "classnames";
import dayjs from "dayjs";
import groupBy from "lodash/groupBy";
import { useDispatch, useSelector } from "react-redux";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import { claimMulti } from "core/rewards";
import { ArkClient } from "core/utilities";
import { CurrencyLogo, FancyButton, HelpInfo, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { DistributionWithStatus, DistributorWithTimings, RewardsState, RootState, TokenInfo, TokenState, WalletState, Nft, TransactionState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { formatZWAPLabel, hexToRGBA, useAsyncTask, useNetwork, useTokenFinder, useValueCalculators } from "app/utils";
import { BIG_ZERO, TBM_CONTRACT } from "app/utils/constants";
import ArkyLogo from "app/components/ArkComponents/ArkTopBar/logo-arky-small.png";
import { ReactComponent as TbmCoin } from "app/assets/icons/tbmCoin.svg";
import { ReactComponent as IconSVG } from "./icon.svg";

interface Props extends BoxProps {
  buttonMode?: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      marginRight: theme.spacing(1),
    },
    "& .MuiAccordion-root:before": {
      height: 0
    },
    "& .MuiAccordion-root.Mui-expanded": {
      backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#13222C", 0.5)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
      margin: 0,
    },
    "& .MuiAccordionSummary-root": {
      display: "inline-flex",
      minHeight: "28px",
      maxHeight: "28px",
      marginLeft: "4px"
    },
    "& .MuiAccordionDetails-root": {
      display: "inherit",
      maxHeight: "200px",
      overflowY: "auto",
      '&::-webkit-scrollbar': {
        width: "0.4rem",
      },
      "&::-webkit-scrollbar-track": {
        margin: theme.spacing(1),
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: `rgba${hexToRGBA("#DEFFFF", 0.1)}`,
        // borderRadius: 12,
        borderRight: "2px solid transparent",
        backgroundClip: "padding-box"
      }
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: 0
    },
    // Checkbox size
    "& .MuiSvgIcon-fontSizeSmall": {
      fontSize: "1rem"
    },
    "& .MuiCheckbox-colorSecondary.Mui-checked": {
      color: theme.palette.primary.dark,
      "&:hover": {
        backgroundColor: "transparent"
      }
    },
    "& .MuiFormControlLabel-root": {
      marginLeft: 0,
      marginRight: 0,
      display: "flex",
      justifyContent: "space-between"
    }
  },
  backdrop: {
    zIndex: 1101,
  },
  card: {
    minWidth: 315,
    padding: theme.spacing(3),
    boxShadow: theme.palette.mainBoxShadow,
    backgroundColor: theme.palette.background.default,
    border: theme.palette.border
  },
  popper: {
    zIndex: 1102,
  },
  topbarButton: {
    padding: "2px 8px",
    color: theme.palette.primary.contrastText,
    border: "1px solid #00FFB0",
    alignItems: "flex-end"
  },
  buttonIcon: {
    marginLeft: theme.spacing(1),
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  tbmCoinLogo: {
    height: "31px",
    width: "32px"
  },
  currencyLogo: {
    height: "28px",
    width: "32px"
  },
  currencyLogoButton: {
    height: "20px",
    width: "20px"
  },
  currencyLogoMd: {
    height: "22px",
    width: "22px"
  },
  currencyLogoSm: {
    height: "17px",
    width: "17px"
  },
  tooltipLeft: {
    marginRight: "5px",
    verticalAlign: "top!important",
  },
  tooltip: {
    marginLeft: "5px",
    verticalAlign: "top!important",
  },
  tooltipMaxWidth: {
    maxWidth: "156px !important"
  },
  claimRewardsButton: {
    padding: "16px",
  },
  rewardBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 10,
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginTop: theme.spacing(1.5)
  },
  dropDownIcon: {
    color: theme.palette.primary.light
  },
  accordion: {
    width: "100%",
    borderRadius: "10px!important",
    boxShadow: "none",
    border: "none",
    backgroundColor: "transparent",
    "& .MuiIconButton-root": {
      padding: 0,
      marginRight: 0
    },
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? `rgba${hexToRGBA("#13222C", 0.5)}` : `rgba${hexToRGBA("#003340", 0.05)}`,
    },
  },
  header: {
    fontSize: "24px"
  },
  balanceAmount: {
    fontSize: "14px",
    marginTop: "8px",
    lineHeight: "16px",
    textAlign: "center",
    whiteSpace: "pre-wrap"
  },
  body: {
    fontSize: "14px",
    fontWeight: "normal"
  },
  currency: {
    fontWeight: 600,
    marginLeft: "2px"
  },
  checkbox: {
    "&.Mui-disabled": {
      color: theme.palette.background.contrast,
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
    },
    "&.Mui-checked.Mui-disabled": {
      color: "#9e9e9e",
    },
    "&:hover": {
      backgroundColor: "transparent"
    },
  },
  totalReward: {
    display: "inline-flex",
    alignItems: "inherit",
    marginBottom: theme.spacing(0.5),
    fontSize: "20px"
  },
  epochReward: {
    display: "inline-flex",
    alignItems: "flex-end",
    fontSize: "14px",
    fontWeight: "normal"
  },
  date: {
    fontWeight: "normal"
  },
  link: {
    color: theme.palette.text?.primary
  },
  linkIcon: {
    marginLeft: theme.spacing(1),
    marginBottom: "2px",
    "& path": {
      fill: theme.palette.text?.secondary,
    }
  },
  successIcon: {
    verticalAlign: "top",
  },
  usdAmount: {
    fontFamily: "Avenir Next"
  },
  progress: {
    marginRight: theme.spacing(1)
  },
  rewardButton: {
    padding: "16px",
    marginBottom: 14,
    minHeight: "50px",
    marginRight: theme.spacing(-1),
    backgroundColor: "#FFDF6B",
    color: "#003340",
    borderRadius: theme.spacing(1.5),
    "&.MuiButtonBase-root": {
      "&:hover": {
        opacity: 0.8,
        backgroundColor: "#FFDF6B",
      }
    }
  },
  errorIcon: {
    fontSize: "1rem",
    verticalAlign: "bottom!important",
    color: theme.palette.text?.secondary,
    marginLeft: "4px",
    marginRight: "-1px",
    "&:hover": {
      color: "#FF5252",
    }
  },
  tokenValue: {
    color: "rgba(222, 255, 255, 0.5)",
    fontSize: "12px",
    textAlign: "center"
  },
  balanceFrame: {
    border: '1px solid rgba(222, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '25px',
    flex: 0.5,
    minWidth: '75px',
    boxSizing: 'content-box'
  },
  arkyLogo: {
    height: "13px",
    marginRight: "8px"
  },
  claimedAmt: {
    fontSize: "20px",
    fontWeight: 400,
    fontFamily: 'Avenir Next',
    color: 'rgba(222, 255, 255, 0.5)'
  }
}));

type ClaimableRewards = DistributionWithStatus & {
  rewardToken: TokenInfo
  rewardDistributor?: DistributorWithTimings
}

const RewardsInfoButton: React.FC<Props> = (props: Props) => {
  const { buttonMode = false, children, className, ...rest } = props;
  const classes = useStyles();
  const valueCalculators = useValueCalculators();
  const network = useNetwork();
  const dispatch = useDispatch();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const transactionState = useSelector<RootState, TransactionState>(state => state.transaction);
  const [active, setActive] = useState<boolean>(false);
  const [claimResult, setClaimResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [bearCount, setBearCount] = useState<number>(0);
  const [selectedRewardsValue, setSelectedRewardsValue] = useState<BigNumber>(new BigNumber(0));
  const [selectedDistributions, setSelectedDistributions] = useState<ReadonlyArray<DistributionWithStatus>>([]); // default should be all claimable distributions
  const [runClaimRewards, loading, error] = useAsyncTask("claimRewards");
  const [runLoadBears] = useAsyncTask("loadBears");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'));
  const tokenFinder = useTokenFinder();

  const zwapAddress = ZWAP_TOKEN_CONTRACT[network];
  const { distributors, distributions, claimedDistributions } = rewardsState;

  useEffect(() => {
    if (!walletState.wallet) return;
    runLoadBears(async () => {
      const arkClient = new ArkClient(network);
      const query: ArkClient.ListTokenParams = { owner: walletState.wallet?.addressInfo.byte20.toLowerCase() };
      const res = await arkClient.listTokens(query);
      const nftList: Nft[] = res.entries;

      const tbmContract = TBM_CONTRACT[network]?.toLowerCase();
      const filtered = nftList.filter((nft) => {
        return nft.collection.address.toLowerCase() === tbmContract
      });
      setBearCount(filtered.length)
    })
    // eslint-disable-next-line
  }, [walletState.wallet, network])

  const txLoading = useMemo(() => {
    if (!claimResult) return false;

    const claimTx = transactionState.submittedTxs.find(t => t.hash === claimResult.hash);
    if (!claimTx) return true;
    if (claimTx && claimTx.status === 'confirmed') {
      setClaimSuccess(true);
    }
    return false
  }, [claimResult, transactionState.submittedTxs])

  const claimableRewards: ReadonlyArray<ClaimableRewards> = distributions.filter(distribution => distribution.readyToClaim).flatMap((d: DistributionWithStatus) => {
    const rewardDistributor = distributors.find(distributor => distributor.distributor_address_hex === d.info.distributor_address)

    if (!rewardDistributor && !d.isTbmFee) {
      return []
    }
    const rewardTokenAddress = 'reward_token_address' in d.info ? d.info.reward_token_address : rewardDistributor?.reward_token_address_hex ?? "";
    const rewardToken = tokenFinder(rewardTokenAddress)!

    return [{ rewardToken, rewardDistributor, ...d }]
  }).filter(r => !!r)

  const claimTooltip = claimableRewards.length === 0 ? 'No rewards to claim' : 'Click to claim your rewards!'

  // group by epoch
  const rewardsByDate = groupBy(claimableRewards, (reward) => {
    if (!!reward.rewardDistributor) {
      const {
        distribution_start_time, epoch_period,
        initial_epoch_number, retroactive_distribution_cutoff_time
      } = reward.rewardDistributor?.emission_info;

      return dayjs.unix(distribution_start_time +
        (epoch_period * (reward.info.epoch_number - initial_epoch_number + (!!retroactive_distribution_cutoff_time ? 0 : 1))))
        .format('DD MMM YY');
    } else if ('reward_token_address' in reward.info) {
      return dayjs(reward.info.epoch).format('DD MMM YY');
    }
  })

  // group by token address
  const rewardsByToken = groupBy(claimableRewards, (reward) => {
    return reward.rewardToken.address;
  })

  const claimableAmountsByToken = Object.fromEntries(Object.entries(rewardsByToken).map(([tokenAddress, rewards]) => {
    return [tokenAddress, rewards.reduce((sum, dist) => {
      return sum.plus(dist.info.amount);
    }, BIG_ZERO)
    ];
  }))

  // USD values
  const totalTokenValue = Object.keys(claimableAmountsByToken).reduce((sum, tokenAddress) => {
    const token = tokenFinder(tokenAddress)
    return sum.plus(valueCalculators.amount(tokenState.prices, token!, claimableAmountsByToken[tokenAddress]));
  }, BIG_ZERO)

  const valuesByDate = Object.fromEntries(Object.entries(rewardsByDate).map(([date, rewards]) => {
    return [date, rewards.reduce((sum, reward) => {
      return sum.plus(valueCalculators.amount(tokenState.prices, reward.rewardToken, reward.info.amount));
    }, BIG_ZERO)
    ];
  }))

  // ZWAP Balance
  const zapTokenBalance: BigNumber = useMemo(() => {
    const zapContractAddr = ZWAP_TOKEN_CONTRACT[network] ?? "";
    return tokenState.tokens[zapContractAddr]?.balance ?? BIG_ZERO;
  }, [network, tokenState.tokens]);

  const zapTokenValue: BigNumber = useMemo(() => {
    if (zapTokenBalance.isZero()) return BIG_ZERO;

    const zapContractAddr = ZWAP_TOKEN_CONTRACT[network] ?? "";
    const zapToken = tokenState.tokens[zapContractAddr];
    if (!zapToken) return BIG_ZERO;

    return valueCalculators.amount(tokenState.prices, zapToken, zapTokenBalance);
  }, [network, tokenState.prices, tokenState.tokens, zapTokenBalance, valueCalculators]);

  const zapBalanceLabel = useMemo(() => formatZWAPLabel(zapTokenBalance), [zapTokenBalance]);

  const onClaimRewards = () => {
    runClaimRewards(async () => {
      if (!walletState.wallet) return;

      // guide users to select rewards
      if (selectedDistributions.length === 0) {
        if (showDetails) {
          setSelectedDistributions(claimableRewards.filter(r => r.funded && !claimedDistributions.includes(r.info.id)));
        } else {
          setShowDetails(true)
        }
        return
      }

      setClaimResult(null);

      let claimTx = null;

      const filteredRewards = claimableRewards.filter(r => !!selectedDistributions.find(d => d.info.id === r.info.id))
      const selectedValue = filteredRewards.reduce((sum, reward) => {
        return sum.plus(valueCalculators.amount(tokenState.prices, reward.rewardToken, reward.info.amount));
      }, BIG_ZERO)

      setSelectedRewardsValue(selectedValue);

      const distributions = selectedDistributions.map(distribution => {
        // drop [leaf hash, ..., root hash]
        const proof = distribution.isTbmFee ? distribution.info.proof : distribution.info.proof.slice(1, distribution.info.proof.length - 1);

        return {
          distrAddr: distribution.info.distributor_address,
          epochNumber: distribution.info.epoch_number,
          amount: distribution.info.amount,
          proof,
        }
      })

      claimTx = await claimMulti({
        network,
        wallet: walletState.wallet,
        distributions
      });

      if (claimTx) {
        setClaimResult(claimTx);

        setSelectedDistributions([]);

        const claimedIds = selectedDistributions.map((dist) => dist.info.id);
        dispatch(actions.Rewards.addClaimedDistributions(claimedIds));
        setTimeout(() => {
          dispatch(actions.Token.refetchState());
        }, 5000);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    })
  };

  // Logic for checkboxes
  const handleSelect = (distribution: DistributionWithStatus) => (_event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDistributionsCopy = selectedDistributions.slice();
    const index = selectedDistributionsCopy.findIndex((d) => d.info.id === distribution.info.id);
    if (index === -1) {
      selectedDistributionsCopy.push(distribution);
      setSelectedDistributions(selectedDistributionsCopy);
    } else {
      selectedDistributionsCopy.splice(index, 1);
      setSelectedDistributions(selectedDistributionsCopy);
    }
  }

  // selectedDistributions.length same as reward distributions that are readyToClaim
  const isAllSelected = useMemo(() => {
    return claimableRewards.length === selectedDistributions.length && selectedDistributions.length > 0;
  }, [claimableRewards, selectedDistributions])

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if checked, selectedDistributions should contain all claimable distributions
    if (event.target.checked) {
      setSelectedDistributions(claimableRewards.filter(r => r.funded && !claimedDistributions.includes(r.info.id)));
    } else {
      setSelectedDistributions([]);
    }
  }

  const isDistributionSelected = (distribution: DistributionWithStatus) => {
    if (claimedDistributions.includes(distribution.info.id)) return true;
    return selectedDistributions.map(d => d.info.id).includes(distribution.info.id);
  }

  const claimButtonText = () => {
    if (claimableRewards.length === 0) {
      return "Nothing to Claim"
    } else if (isAllSelected) {
      return "Claim Rewards (All)";
    } else if (selectedDistributions.length) {
      return `Claim Rewards (${selectedDistributions.length})`;
    } else if (loading || txLoading) {
      return "Claiming Rewards"
    } else {
      return "Select Reward to Claim";
    }
  }

  if (!walletState.wallet) return null;

  const popperModifiers = {
    flip: {
      enabled: true,
    },
    preventOverflow: {
      enabled: true,
      boundariesElement: 'scrollParent',
    },
    arrow: {
      enabled: true,
    },
  } as const;

  const displayRewardAmount = (amount: BigNumber) => {
    return amount.isLessThan(0.001)
      ? amount.toFormat(4)
      : amount.isLessThan(0.01)
        ? amount.toFormat(3)
        : amount.toFormat(2)
  }

  const resetClaimedRewardStates = () => {
    setClaimSuccess(false);
    setSelectedRewardsValue(new BigNumber(0));
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Fragment>
        {
          isMobileView
            ? (
              buttonMode
                ? <FancyButton onClick={() => setActive(!active)} ref={buttonRef} className={classes.rewardButton} variant="contained" >
                  Claim Reward
                </FancyButton>
                : <IconButton onClick={() => setActive(!active)} ref={buttonRef}>
                  <IconSVG />
                </IconButton>
            ) : (
              <Button
                size="small"
                ref={buttonRef}
                className={classes.topbarButton}
                variant="outlined"
                onClick={() => setActive(!active)}>
                {zapBalanceLabel}
                <CurrencyLogo currency="ZWAP" address={zwapAddress} className={cls(classes.currencyLogo, classes.currencyLogoButton)} />
              </Button>
            )}
      </Fragment>
      <Popper
        open={active}
        placement="bottom-end"
        className={classes.popper}
        anchorEl={buttonRef?.current}
        disablePortal
        modifiers={popperModifiers}>
        <Box marginTop={2}>
          <ClickAwayListener onClickAway={() => setActive(false)}>
            <Card className={classes.card}>
              <Box display="flex" flexDirection="column" alignItems="center" gridRowGap="18px">
                <Text variant="h6" color="textPrimary" className={classes.header}>Your Balance</Text>
                {claimSuccess && <>
                  <Text variant="h4" className={classes.textColoured}>
                    <CheckCircleRoundedIcon fontSize="inherit" className={classes.successIcon} />
                    &nbsp;
                    Rewards claimed successfully!
                  </Text>
                  <Text className={classes.claimedAmt}>
                    ≈ ${selectedRewardsValue.toFormat(2)}
                  </Text>
                  <Link
                    className={classes.link}
                    underline="none"
                    rel="noopener noreferrer"
                    target="_blank"
                    href={`https://viewblock.io/zilliqa/tx/0x${claimResult?.hash}?network=${network?.toLowerCase()}`}>
                    <Box display="flex" justifyContent="center" alignItems="center" mt={0.5}>
                      <Text className={classes.body}>View on Viewblock</Text>
                      <NewLinkIcon className={classes.linkIcon} />
                    </Box>
                  </Link>
                  <Button fullWidth variant="contained" color="primary" className={classes.claimRewardsButton} onClick={() => resetClaimedRewardStates()}>
                    Back to Reward Balance
                  </Button>
                </>}
                {!claimSuccess && <Box display="flex" flexDirection="row" width="100%" gridColumnGap="8px" marginTop="16px">
                  <Box display="flex" flexDirection="column" alignItems="center" className={classes.balanceFrame}>
                    <CurrencyLogo currency="ZWAP" address={zwapAddress} className={classes.currencyLogo} />
                    <Text variant="h2" className={classes.balanceAmount}>
                      {zapBalanceLabel} ZWAP
                    </Text>
                    <Text marginTop={0.5} className={classes.tokenValue}>
                      ≈ {zapTokenValue.toFormat(2)} USD
                    </Text>
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="center" className={classes.balanceFrame}>
                    <TbmCoin className={classes.tbmCoinLogo} />
                    <Text variant="h2" className={classes.balanceAmount}>
                      {bearCount} BEAR
                    </Text>
                  </Box>
                </Box>}
              </Box>
              {!claimSuccess && <>
                <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                  <Text className={classes.body}>
                    Rewards Claimable
                    <HelpInfo placement="bottom"
                      title={<span>The estimated amount of rewards you have collected and are eligible to claim (includes <b>ARKY</b> and <b>liquidity mining</b> rewards).</span>}
                      className={classes.tooltip} additionalStyling={classes.tooltipMaxWidth} />
                  </Text>
                  {
                    claimableRewards.length !== 0 &&
                    <Box className={classes.rewardBox} bgcolor="background.contrast" width="100%">
                      {
                        Object.keys(claimableAmountsByToken).map(tokenAddress => {
                          const token = tokenFinder(tokenAddress)!
                          return (
                            <Text variant="h4" className={classes.totalReward} key={tokenAddress}>
                              {displayRewardAmount(claimableAmountsByToken[tokenAddress].shiftedBy(-token!.decimals))}&nbsp;
                              <CurrencyLogo currency={token?.symbol} address={token?.address} className={cls(classes.currencyLogo, classes.currencyLogoMd)} />&nbsp;
                              <span className={classes.currency}>
                                {token.symbol}
                              </span>
                            </Text>
                          )
                        })
                      }
                      <Text marginBottom={1} variant="body2" color="textSecondary" className={classes.usdAmount}>
                        ≈ ${totalTokenValue.toFormat(2)}
                      </Text>
                      <Accordion className={classes.accordion} expanded={showDetails} onChange={(_, expanded) => setShowDetails(expanded)}>
                        <Box display="flex" justifyContent="center" width="100%">
                          <AccordionSummary expandIcon={<ArrowDropDownIcon className={classes.dropDownIcon} />}>
                            <Text color="textSecondary">View Details</Text>
                          </AccordionSummary>
                        </Box>
                        <AccordionDetails>
                          <Box display="flex" flexDirection="column">
                            {/* Select/Unselect all */}
                            <Box>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    className={classes.checkbox}
                                    icon={<IndeterminateCheckBoxIcon fontSize="small" />}
                                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                  />
                                }
                                label={
                                  <Text color="textSecondary">
                                    {isAllSelected ? "Unselect all" : "Select all"}
                                  </Text>
                                }
                              />
                            </Box>

                            <Box mb={0.5} />

                            {Object.keys(rewardsByDate).sort((a, b) => a === b ? 0 : (dayjs(a) > dayjs(b) ? -1 : 1)).map(date => {
                              return (
                                <Box mt={1} key={date}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Text className={classes.date}>
                                      {date}
                                    </Text>
                                    <Text variant="body2" color="textSecondary" className={classes.usdAmount}>
                                      ≈ ${valuesByDate[date].toFormat(2)}
                                    </Text>
                                  </Box>
                                  <Divider />
                                  {rewardsByDate[date].map(reward => {
                                    const token = reward.rewardToken;
                                    const isDisabled = !reward.funded || claimedDistributions.includes(reward.info.id);

                                    return (
                                      <Box mt={0.5} key={reward.info.id}>
                                        <FormControlLabel
                                          control={
                                            reward.funded === null
                                              ? <CircularProgress size={16} />
                                              : <Checkbox
                                                disabled={isDisabled}
                                                className={classes.checkbox}
                                                checked={isDistributionSelected(reward)}
                                                onChange={handleSelect(reward)}
                                              />
                                          }
                                          label={
                                            <Text className={classes.epochReward}>
                                              {reward.isTbmFee && <img src={ArkyLogo} alt="arkyLogo" className={classes.arkyLogo} />}
                                              {displayRewardAmount(reward.info.amount.shiftedBy(-token.decimals))}&nbsp;
                                              <CurrencyLogo currency={token.symbol} address={token.address} className={cls(classes.currencyLogo, classes.currencyLogoSm)} />&nbsp;
                                              <span className={classes.currency}>
                                                {token.symbol}
                                                <HelpInfo
                                                  placement="top"
                                                  title={
                                                    reward.funded === null
                                                      ? "Checking if rewards are in..."
                                                      : reward.funded === false
                                                        ? "Reward pending distribution from project owner."
                                                        : reward.isTbmFee
                                                          ? "ZWAP rewards from holding ZWAP and/or BEARs."
                                                          : `${reward.rewardDistributor?.name} from ${reward.rewardDistributor?.distributor_name} at ${reward.rewardDistributor?.distributor_address_hex} for epoch ${reward.info.epoch_number}.`
                                                  }
                                                  className={classes.tooltip}
                                                  icon={reward.funded === false ? <ErrorIcon className={classes.errorIcon} /> : undefined}
                                                />
                                              </span>
                                            </Text>
                                          }
                                        />
                                      </Box>
                                    )
                                  })}
                                </Box>
                              )
                            })}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  }
                </Box>
                <Box marginTop={2}>
                  <Tooltip title={claimTooltip}>
                    <span>
                      <Button fullWidth variant="contained" color="primary" disabled={claimableRewards.length === 0 || loading || txLoading} onClick={onClaimRewards} className={classes.claimRewardsButton}>
                        {(loading || txLoading) && <CircularProgress size="1em" color="inherit" className={classes.progress} />}
                        {claimButtonText()}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>

                {claimResult && (
                  <Box display="flex" marginTop={1} flexDirection="column" alignItems="center">
                    <Text marginTop={2} variant="h4" className={classes.textColoured}>
                      <CheckCircleRoundedIcon fontSize="inherit" className={classes.successIcon} />
                      &nbsp;
                      Claim transaction submitted!
                    </Text>
                    <Link
                      className={classes.link}
                      underline="none"
                      rel="noopener noreferrer"
                      target="_blank"
                      href={`https://viewblock.io/zilliqa/tx/0x${claimResult?.hash}?network=${network?.toLowerCase()}`}>
                      <Box display="flex" justifyContent="center" alignItems="center" mt={0.5}>
                        <Text className={classes.body}>View on Viewblock</Text>
                        <NewLinkIcon className={classes.linkIcon} />
                      </Box>
                    </Link>
                  </Box>
                )}

                {!!error && (
                  <Box mt={1.5} display="flex" justifyContent="center">
                    <Text variant="body1" color="error">
                      {error.message ?? "Unknown error"}
                    </Text>
                  </Box>
                )}
              </>}

            </Card>
          </ClickAwayListener>
        </Box>
      </Popper>
      <Backdrop className={classes.backdrop} open={active}>
      </Backdrop>
    </Box>
  );
};


export default RewardsInfoButton;
