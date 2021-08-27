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
import { PendingClaimTx, RewardsState, RootState, TokenState, WalletState, DistributionWithStatus } from "app/store/types";
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
  const [selectedDistributions, setSelectedDistributions] = useState<DistributionWithStatus[]>([]); // default should be all claimable distributions
  const [runClaimRewards, loading, error] = useAsyncTask("claimRewards");
  const buttonRef = useRef();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'));
  const tokenFinder = useTokenFinder();

  const walletAddress = useMemo(() => walletState.wallet?.addressInfo.bech32, [walletState.wallet]);

  const {
    claimableRewards,
    claimTooltip,
  } = useMemo(() => {
    const claimableRewards = rewardsState.distributions.reduce((sum, dist) => {
      return (dist.readyToClaim) ? sum.plus(dist.info.amount) : sum;
    }, BIG_ZERO);

    let claimTooltip = "No rewards to claim";
    if (!claimableRewards.isZero()) {
      claimTooltip = "Click to claim your rewards!";
    }

    return {
      claimableRewards,
      claimTooltip,
    };

    // eslint-disable-next-line
  }, [walletAddress, rewardsState.distributions]);

  // New code for claimable rewards
  const distributions = rewardsState.distributions.filter(distribution => distribution.readyToClaim);
  const distributors = rewardsState.distributors;

  // group by epoch
  const distributionsByEpoch = groupBy(distributions, (reward) => {
    return reward.info.epoch_number;
  })

  // group by token (distributor address)
  const distributionsByToken = groupBy(distributions, (reward) => {
    return reward.info.distributor_address;
  })

  const claimableRewardsByToken = Object.fromEntries(Object.entries(distributionsByToken).map(([distrAddress, distributions]) => {
    return [distrAddress, distributions.reduce((sum, dist) => {
        return sum.plus(dist.info.amount);
      }, BIG_ZERO)
    ];
  }))

  // USD values
  const totalTokenValue = Object.keys(claimableRewardsByToken).reduce((sum, dist) => {
    const rewardDistributor = distributors.find(distributor => distributor.distributor_address_hex === dist);

    if (rewardDistributor) {
      const token = tokenFinder(rewardDistributor.reward_token_address_hex);

      return token ? sum.plus(valueCalculators.amount(tokenState.prices, token, claimableRewardsByToken[dist])) : sum;
    }

    return sum;
  }, BIG_ZERO)

  const valuesByEpoch = Object.fromEntries(Object.entries(distributionsByEpoch).map(([epochNumber, distributions]) => {
    return [epochNumber, distributions.reduce((sum, dist) => {
        const rewardDistributor = distributors.find(distributor => distributor.distributor_address_hex === dist.info.distributor_address);

        if (rewardDistributor) {
          const token = tokenFinder(rewardDistributor.reward_token_address_hex);

          return token ? sum.plus(valueCalculators.amount(tokenState.prices, token, dist.info.amount)) : sum;
        }

        return sum;
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
      if (claimableRewards.isZero() || !walletState.wallet) return;
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

  // Logic for checkboxes - check if there's a more efficient way -> just storing ids?
  const handleSelect = (distribution: DistributionWithStatus) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDistributionsCopy = selectedDistributions.slice();

    // if checked, add to selectedDistributions array
    if (event.target.checked) {
      selectedDistributionsCopy.push(distribution);
      setSelectedDistributions(selectedDistributionsCopy);
    } else {
      const index = selectedDistributionsCopy.indexOf(distribution);
      if (index !== -1) {
        selectedDistributionsCopy.splice(index, 1);
        setSelectedDistributions(selectedDistributionsCopy);
      }
    }
  }

  // selectedDistributions.length same as reward distributions that are readyToClaim
  const isAllSelected = useMemo(() => {
    return distributions.length === selectedDistributions.length;
  }, [distributions, selectedDistributions])

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if checked, selectedDistributions should contain all claimable distributions
    if (event.target.checked) {
      setSelectedDistributions(distributions);
    } else {
      setSelectedDistributions([]);
    }
  }

  const isDistributionSelected = (distribution: DistributionWithStatus) => {
    return selectedDistributions.includes(distribution);
  }

  const claimButtonText = () => {
    if (claimableRewards.isZero()) {
      return "Nothing to Claim"
    } else if (isAllSelected) {
      return "Claim Rewards (All)";
    } else if (selectedDistributions.length) {
      return `Claim Rewards (${selectedDistributions.length})`;
    } else {
      return "Select Reward to Claim";
    }
  }

  const zwapAddress = ZWAP_TOKEN_CONTRACT[network];
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
          : <Badge variant="dot" invisible={claimableRewards.isZero()}>
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
                  !claimableRewards.isZero() &&
                  <Box className={classes.rewardBox} bgcolor="background.contrast" width="100%">
                    {
                      Object.keys(claimableRewardsByToken).map(key => {
                        // to check if can be more efficient here
                        const rewardDistributor = distributors.find(distributor => distributor.distributor_address_hex === key);

                        // to get token decimals
                        const token = tokenFinder(rewardDistributor!.reward_token_address_hex);

                        return (
                          <Text variant="h4" className={classes.totalReward}>
                            {/* toHumanNumber? */}
                            {claimableRewardsByToken[key].shiftedBy(-token!.decimals).toFormat(2)}
                            <CurrencyLogo address={token?.address} className={cls(classes.currencyLogo, classes.currencyLogoMd)}/>
                            <span className={classes.currency}>
                              {rewardDistributor?.reward_token_symbol}
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
                          {Object.keys(distributionsByEpoch).reverse().map(key => {
                            return (
                              <Box mt={1}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                  <Text className={classes.date}>
                                    {/* Convert epoch number into date */}
                                    {epochNumberToDate(key)}
                                  </Text>
                                  <Text variant="body2" color="textSecondary" className={classes.usdAmount}>
                                    ≈ ${valuesByEpoch[key].toFormat(2)}
                                  </Text>
                                </Box>
                                <Divider />
                                {distributionsByEpoch[key].map(reward => {
                                  // to check if can be more efficient here
                                  const rewardDistributor = distributors.find(distributor => distributor.distributor_address_hex === reward.info.distributor_address);
                                  // const rewardDistributor = {"name":"ZWAP Rewards","reward_token_symbol":"ZWAP","reward_token_address_hex":"0xb2b119e2496f24590eff419f15aa1b6e82aa7074","distributor_name":"Zilswap","distributor_address_hex":"0x55fc7c40cc9d190aad1499c00102de0828c06d41","developer_address":"zil1ytk3ykwlc2vy8fyp7wqp492zjassj5mxzgscv6","emission_info":{"epoch_period":604800,"tokens_per_epoch":"6250_000_000_000_000","tokens_for_retroactive_distribution":"50000_000_000_000_000","retroactive_distribution_cutoff_time":1628230000,"distribution_start_time":1628240000,"total_number_of_epochs":152,"initial_epoch_number":1,"developer_token_ratio_bps":1500,"trader_token_ratio_bps":2000},"incentived_pools":{"zil10a9z324aunx2qj64984vke93gjdnzlnl5exygv":2,"zil1k2c3ncjfduj9jrhlgx03t2smd6p25ur56cfzgz":5,"zil1fytuayks6njpze00ukasq3m4y4s44k79hvz8q5":3}};

                                  // to get token decimals
                                  const token = tokenFinder(rewardDistributor!.reward_token_address_hex);

                                  return (
                                    <Box mt={0.5}>
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
                                            {reward.info.amount.shiftedBy(-token!.decimals).toFormat(2)}
                                            <CurrencyLogo address={token?.address} className={cls(classes.currencyLogo, classes.currencyLogoSm)}/>
                                            <span className={classes.currency}>
                                            {rewardDistributor?.reward_token_symbol}
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
                    <Button fullWidth variant="contained" color="primary" disabled={claimableRewards.isZero()} onClick={onClaimRewards} className={classes.claimRewardsButton}>
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
