import { Accordion, AccordionDetails, AccordionSummary, Backdrop, Badge, Box, BoxProps, Button, Card, Checkbox, CircularProgress, ClickAwayListener, Divider, FormControlLabel, IconButton, Link, Popper, Tooltip } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import CheckBoxIcon from "@material-ui/icons/CheckBoxRounded";
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import IndeterminateCheckBoxIcon from "@material-ui/icons/IndeterminateCheckBoxRounded";
import { CurrencyLogo, HelpInfo, Text } from "app/components";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { PendingClaimTx, RewardsState, RootState, TokenState, WalletState, DistributionWithStatus, TokenInfo, DistributorWithTimings } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useAsyncTask, useNetwork, useTokenFinder, useValueCalculators } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import { formatZWAPLabel } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import { claimMulti } from "core/rewards";
import dayjs from "dayjs";
import groupBy from "lodash/groupBy";
import React, { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as IconSVG } from './icon.svg';

interface Props extends BoxProps {

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
    minWidth: 300,
    padding: theme.spacing(3),
    boxShadow: theme.palette.mainBoxShadow,
    backgroundColor: theme.palette.background.default,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF"
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
  currencyLogo: {
    marginLeft: "2px",
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
  tooltip: {
    marginLeft: "5px",
    verticalAlign: "top!important",
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
    fontSize: "16px"
  },
  balanceAmount: {
    fontSize: "28px"
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
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
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
  }
}));

type ClaimableRewards = DistributionWithStatus & {
  rewardToken: TokenInfo
  rewardDistributor: DistributorWithTimings
}

const RewardsInfoButton: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const valueCalculators = useValueCalculators();
  const network = useNetwork();
  const dispatch = useDispatch();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const [active, setActive] = useState<boolean>(false);
  const [claimResult, setClaimResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedDistributions, setSelectedDistributions] = useState<ReadonlyArray<DistributionWithStatus>>([]); // default should be all claimable distributions
  const [runClaimRewards, loading, error] = useAsyncTask("claimRewards");
  const buttonRef = useRef();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'));
  const tokenFinder = useTokenFinder();

  const zwapAddress = ZWAP_TOKEN_CONTRACT[network];
  const { distributors, distributions } = rewardsState;

  const claimableRewards: ReadonlyArray<ClaimableRewards> = distributions.filter(distribution => distribution.readyToClaim).map((d: DistributionWithStatus) => {
    const rewardDistributor = distributors.find(distributor => distributor.distributor_address_hex === d.info.distributor_address)

    if (!rewardDistributor) {
      throw new Error(`Could not find ${d.info.distributor_address} in distributors!`)
    }
    const rewardToken = tokenFinder(rewardDistributor.reward_token_address_hex)!

    return { rewardToken, rewardDistributor, ...d }
  })

  const claimTooltip = claimableRewards.length === 0 ? 'No rewards to claim' : 'Click to claim your rewards!'

  // group by epoch
  const rewardsByEpoch = groupBy(claimableRewards, (reward) => {
    return reward.info.epoch_number;
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

  const valuesByEpoch = Object.fromEntries(Object.entries(rewardsByEpoch).map(([epochNumber, rewards]) => {
    return [epochNumber, rewards.reduce((sum, reward) => {
        return sum.plus(valueCalculators.amount(tokenState.prices, reward.rewardToken, reward.info.amount));
      }, BIG_ZERO)
    ];
  }))

  const epochNumberToDate = (epochNo: string) => {
    const epoch_number = parseInt(epochNo);
    const { distribution_start_time, epoch_period } = distributors[0].emission_info;

    return dayjs.unix(distribution_start_time + (epoch_period * epoch_number)).format('DD MMM');
  }

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
          setSelectedDistributions(claimableRewards);
        } else {
          setShowDetails(true)
        }
        return
      }

      let claimTx = null;

      const distributions = selectedDistributions.map(distribution => {
        // drop [leaf hash, ..., root hash]
        const proof = distribution.info.proof.slice(1, distribution.info.proof.length - 1);

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

      // pendingTx
      const pendingTx: PendingClaimTx = {
        dispatchedAt: dayjs(),
        txHash: claimTx.hash,
      };

      dispatch(actions.Rewards.addPendingClaimTx(
        walletState.wallet.addressInfo.bech32,
        pendingTx,
      ));

      if (claimTx) {
        setClaimResult(claimTx);
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
    return claimableRewards.length === selectedDistributions.length;
  }, [claimableRewards, selectedDistributions])

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if checked, selectedDistributions should contain all claimable distributions
    if (event.target.checked) {
      setSelectedDistributions(claimableRewards);
    } else {
      setSelectedDistributions([]);
    }
  }

  const isDistributionSelected = (distribution: DistributionWithStatus) => {
    return selectedDistributions.map(d => d.info.id).includes(distribution.info.id);
  }

  const claimButtonText = () => {
    if (claimableRewards.length === 0) {
      return "Nothing to Claim"
    } else if (isAllSelected) {
      return "Claim Rewards (All)";
    } else if (selectedDistributions.length) {
      return `Claim Rewards (${selectedDistributions.length})`;
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
      element: buttonRef?.current,
    },
  } as const;

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <span>
        {
          isMobileView
          ? <IconButton onClick={() => setActive(!active)} buttonRef={buttonRef}>
              <IconSVG />
            </IconButton>
          : <Badge variant="dot" invisible={claimableRewards.length === 0}>
              <Button
                size="small"
                buttonRef={buttonRef}
                className={classes.topbarButton}
                variant="outlined"
                onClick={() => setActive(!active)}>
                {zapBalanceLabel}
                <CurrencyLogo currency="ZWAP" address={zwapAddress} className={cls(classes.currencyLogo, classes.currencyLogoButton)}/>
              </Button>
            </Badge>
        }
      </span>
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
              <Box display="flex" flexDirection="column" alignItems="center">
                <Text variant="h6" color="textPrimary" className={classes.header}>Your ZWAP Balance</Text>
                <Box display="flex" marginTop={1}>
                  <Text variant="h2" className={cls(classes.textColoured, classes.balanceAmount)}>
                    {zapBalanceLabel}
                  </Text>
                  <CurrencyLogo currency="ZWAP" address={zwapAddress} className={classes.currencyLogo}/>
                </Box>
                <Text marginTop={0.5} className={cls(classes.textColoured, classes.body)}>
                  ≈ ${zapTokenValue.toFormat(2)}
                </Text>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
                <Text className={classes.body}>
                  Claimable Rewards
                  <HelpInfo placement="bottom" title="The estimated amount of rewards you have collected and are eligible to claim." className={classes.tooltip}/>
                </Text>
                {
                  claimableRewards.length !== 0 &&
                  <Box className={classes.rewardBox} bgcolor="background.contrast" width="100%">
                    {
                      Object.keys(claimableAmountsByToken).map(tokenAddress => {
                        const token = tokenFinder(tokenAddress)!
                        return (
                          <Text variant="h4" className={classes.totalReward} key={tokenAddress}>
                            {/* toHumanNumber? */}
                            {claimableAmountsByToken[tokenAddress].shiftedBy(-token!.decimals).toFormat(2)}
                            <CurrencyLogo address={token?.address} className={cls(classes.currencyLogo, classes.currencyLogoMd)}/>
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

                          {/* Rewards by epoch should be refactored into one component*/}
                          {Object.keys(rewardsByEpoch).reverse().map(epoch => {
                            return (
                              <Box mt={1} key={epoch}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                  <Text className={classes.date}>
                                    {/* Convert epoch number into date */}
                                    {epochNumberToDate(epoch)}
                                  </Text>
                                  <Text variant="body2" color="textSecondary" className={classes.usdAmount}>
                                    ≈ ${valuesByEpoch[epoch].toFormat(2)}
                                  </Text>
                                </Box>
                                <Divider />
                                {rewardsByEpoch[epoch].map(reward => {
                                  const token = reward.rewardToken

                                  return (
                                    <Box mt={0.5} key={reward.info.id}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                          className={classes.checkbox}
                                          checked={isDistributionSelected(reward)}
                                          onChange={handleSelect(reward)}
                                          />
                                        }
                                        label={
                                          <Text className={classes.epochReward}>
                                            {/* Need toHumanNumber? */}
                                            {reward.info.amount.shiftedBy(-token.decimals).toFormat(2)}
                                            <CurrencyLogo address={token.address} className={cls(classes.currencyLogo, classes.currencyLogoSm)}/>
                                            <span className={classes.currency}>
                                            {token.symbol}
                                            <HelpInfo placement="top" title={`${reward.rewardDistributor.name} from ${reward.rewardDistributor.distributor_name} at ${
                                              reward.rewardDistributor.distributor_address_hex} for epoch ${reward.info.epoch_number}.`} className={classes.tooltip}/>
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

              <Box marginTop={2} />
              {
                claimResult
                ?
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Text marginTop={2} variant="h4" className={classes.textColoured}>
                    <CheckCircleRoundedIcon fontSize="inherit" className={classes.successIcon} />
                    {" "}
                    Reward claims successful!
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
                :
                <Tooltip title={claimTooltip}>
                  <span>
                    <Button fullWidth variant="contained" color="primary" disabled={claimableRewards.length === 0} onClick={onClaimRewards} className={classes.claimRewardsButton}>
                      {loading && <CircularProgress size="1em" color="inherit" className={classes.progress} />}
                      {claimButtonText()}
                    </Button>
                  </span>
                </Tooltip>
              }

              {!!error && (
                <Box mt={1.5} display="flex" justifyContent="center">
                  <Text variant="body1" color="error">
                    {error.message ?? "Unknown error"}
                  </Text>
                </Box>
              )}

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
