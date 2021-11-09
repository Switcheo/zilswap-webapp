import React, { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, CardProps, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ViewHeadline, ArrowDropUp, ArrowDropDown } from "@material-ui/icons";
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import groupBy from "lodash/groupBy";
import { toBech32Address } from "@zilliqa-js/crypto";
import { CurrencyLogo, FancyButton, KeyValueDisplay, Text, ConnectWalletButton } from "app/components";
import { actions } from "app/store";
import { EMPTY_USD_VALUE } from "app/store/token/reducer";
import { PoolSwapVolumeMap, RewardsState, RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, toHumanNumber, useNetwork, useValueCalculators } from "app/utils";
import { BIG_ONE, BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";

interface Props extends CardProps {
  token: TokenInfo;
}

const PoolInfoCard: React.FC<Props> = (props: Props) => {
  const { children, className, token, ...rest } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const valueCalculators = useValueCalculators();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const swapVolumes = useSelector<RootState, PoolSwapVolumeMap>(state => state.stats.dailySwapVolumes)
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const network = useNetwork();
  const classes = useStyles();
  const [showDetail, setShowDetail] = useState(false);

  const onGotoAddLiquidity = () => {
    dispatch(actions.Pool.select({ network, token }));
    dispatch(actions.Layout.showPoolType("add"));
    history.push("/pool");
  }
  const { totalZilVolumeUSD, usdValues } = useMemo(() => {
    if (token.isZil) {
      return { totalLiquidity: BIG_ZERO, usdValues: EMPTY_USD_VALUE };
    }

    const usdValues = tokenState.values[token.address] ?? EMPTY_USD_VALUE;
    const totalZilVolume = swapVolumes[token.address]?.totalZilVolume ?? BIG_ZERO;
    const totalZilVolumeUSD = valueCalculators.amount(tokenState.prices, tokenState.tokens[ZIL_ADDRESS], totalZilVolume);

    return {
      totalZilVolumeUSD,
      usdValues,
    };
  }, [tokenState, token, valueCalculators, swapVolumes]);


  const {
    poolRewards,
    roi,
    apr,
    preStartDistributors
  } = React.useMemo(() => {
    const poolRewards = rewardsState.rewardsByPool[token.address] || [];

    // calculate total roi and apr
    const roiPerSecond = usdValues.rewardsPerSecond.dividedBy(usdValues.poolLiquidity);
    const secondsPerDay = 24 * 3600
    const roiPerDay = roiPerSecond.times(secondsPerDay).shiftedBy(2).decimalPlaces(2);
    const apr = roiPerSecond.times(secondsPerDay * 365).shiftedBy(2).decimalPlaces(1);
    const preStartDistributors = rewardsState.distributors.filter((distributor) => !dayjs().isAfter(distributor.emission_info.distribution_start_time * 1000));

    return {
      poolRewards,
      roi: roiPerDay.isZero() || roiPerDay.isNaN() ? "-" : `${roiPerDay.dp(2).toFormat()}%`,
      apr: apr.isZero() || apr.isNaN() ? '-' : `${apr.dp(2).toFormat()}%`,
      preStartDistributors,
    };
  }, [rewardsState.rewardsByPool, rewardsState.distributors, token, usdValues]);


  if (token.isZil) return null;

  const decimals = token.address === ZIL_ADDRESS ? 12 : (token.decimals ?? 0);

  const poolShare = token.pool?.contributionPercentage.shiftedBy(-2) ?? BIG_ZERO;
  const poolShareLabel = poolShare.shiftedBy(2).decimalPlaces(3).toString(10) ?? "";
  const tokenAmount = toHumanNumber(poolShare.times(token.pool?.tokenReserve ?? BIG_ZERO).shiftedBy(-decimals));
  const zilAmount = toHumanNumber(poolShare.times(token.pool?.zilReserve ?? BIG_ZERO).shiftedBy(-12));
  // const depositedValue = poolShare.times(usdValues?.poolLiquidity ?? BIG_ZERO);

  const potentialRewards = rewardsState.potentialRewardsByPool[token.address] || [];

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <CardContent className={cls(classes.content, { [classes.selectedCard]: showDetail })}>
        <Box flex={.5} mr={2} justifyContent="center" display="flex">
          <Box display="flex" flexDirection="column" minWidth="60px">
            <Box display="flex" justifyContent="flex-start">
              <CurrencyLogo className={classes.logo} currency={token.symbol} address={token.address} />
            </Box>
            <Divider className={classes.divider} />
            <Box display="flex" justifyContent="flex-end">
              <CurrencyLogo className={classes.logo} currency="ZIL" address={ZIL_ADDRESS} />
            </Box>
          </Box>
        </Box>
        <Box flex={2} justifyContent="flex-start" display="flex" flexDirection="column">
          <Box px={"16px"} display="flex">
            <Text className={classes.poolSize}>{toHumanNumber(token.pool?.tokenReserve.shiftedBy(-decimals), 2)}</Text>
            <Text className={classes.token}>{token.symbol}</Text>
          </Box>
          <Box px={"16px"} display="flex">
            <Text className={classes.poolSize}>{toHumanNumber(token.pool?.zilReserve.shiftedBy(-12), 2)}</Text>
            <Text className={classes.token}>ZIL</Text>
          </Box>
        </Box>

        <Box flex={2} justifyContent="flex-start" display="flex" className={classes.statContainer} px={1}>
          <Box display="flex" className={classes.statItem}>
            <Text variant="h1" color="textPrimary" className={classes.rewardValue}>
              {poolRewards.length > 0 ?
                "$" + Object.entries(groupBy(poolRewards, (reward) => reward.rewardToken.address))
                  .filter(([address, rewards]) => {
                    return !preStartDistributors?.find(distributor => toBech32Address(distributor.reward_token_address_hex) === address)
                  })
                  .reduce((total, [address, rewards]) =>
                    total.plus(rewards.reduce((acc, reward) =>
                      acc.plus(reward.amountPerEpoch), BIG_ZERO).shiftedBy(-rewards[0].rewardToken.decimals).times(tokenState.prices[address] || BIG_ONE)), BIG_ZERO)
                  .toFormat(2)
                :
                "-"}
              {
                poolRewards.length > 0 ?
                  <>
                    {Object.entries(groupBy(poolRewards, (reward) => reward.rewardToken.address))
                      .filter(([address, rewards]) => {
                        return !preStartDistributors?.find(distributor => toBech32Address(distributor.reward_token_address_hex) === address)
                      })
                      .map(([address, rewards]) => {
                        return (
                          <Text variant="body2" color="textPrimary" className={classes.currencyReward}>
                            {rewards.reduce((acc, reward) => acc.plus(reward.amountPerEpoch), BIG_ZERO).shiftedBy(-rewards[0].rewardToken.decimals).toFormat(2)}&nbsp;<Text className={classes.textColoured}>{rewards[0].rewardToken.symbol}</Text>
                          </Text>
                        )
                      })}
                  </>
                  :
                  <Text color="textPrimary" className={classes.rewardValue}>
                    -
                  </Text>
              }
            </Text>
            {/* {
              poolRewards.length > 0 ?
                <>
                  {Object.entries(groupBy(poolRewards, (reward) => reward.rewardToken.address))
                    .filter(([address, rewards]) => {
                      return !preStartDistributors?.find(distributor => toBech32Address(distributor.reward_token_address_hex) === address)
                    })
                    .map(([address, rewards]) => {
                      return (
                        <Box display="flex" className={classes.rewardContainer} alignItems="flex-end" flexWrap="wrap" key={address}>
                          <Text variant="h1" color="textPrimary" className={classes.rewardValue}>
                            {rewards.reduce((acc, reward) => acc.plus(reward.amountPerEpoch), BIG_ZERO).shiftedBy(-rewards[0].rewardToken.decimals).toFormat(2)}
                          </Text>
                          <CurrencyLogo className={classes.rewardTokenLogo} currency={rewards[0].rewardToken.symbol} address={address} />
                        </Box>
                      )
                    })}
                </>
                :
                <Text color="textPrimary" className={classes.rewardValue}>
                  -
                </Text>
            } */}
          </Box>


        </Box>


        <Box flex={1.5} display="flex" flexDirection="column" >
          <Box display="flex" className={classes.statItem}>
            <Text color="textPrimary" className={classes.rewardValue}>
              {apr}
            </Text>
          </Box>
          <Box display="flex" className={classes.statItem}>
            <Text color="textPrimary" className={classes.roiValue}>
              Daily ROI <Text className={classes.roiNumber}>{roi}</Text>
            </Text>
          </Box>
        </Box>
        <Box flex={1} pr={2}>
          <Button onClick={() => setShowDetail(!showDetail)} className={classes.detailButton}>Details {showDetail ? <ArrowDropUp /> : <ArrowDropDown />}</Button>
        </Box>
        <Box flex={1.5}>
          <FancyButton onClick={() => onGotoAddLiquidity()} className={classes.addLiquidity}>Add Liquidity</FancyButton>
        </Box>
      </CardContent>

      {showDetail && (
        <CardContent className={classes.extraContent}>
          <Box flex={1}>
            <KeyValueDisplay marginBottom={1.5} kkey="Pool Name" ValueComponent="span" className={classes.keyDisplay}>
              <Box mt={1}>
                <Text variant="h4"> <span className={classes.titleColoured}>{token.symbol}</span> - <span className={classes.titleColoured}> ZIL </span></Text>
              </Box>
            </KeyValueDisplay>
          </Box>

          <Box flex={1}>
            <KeyValueDisplay marginBottom={1.5} kkey="Total Liquidity" ValueComponent="span" className={classes.keyDisplay}>
              <Box mt={1}>
                <Text variant="h4" >${usdValues?.poolLiquidity.dp(0).toFormat()}</Text>
              </Box>
            </KeyValueDisplay>
          </Box>
          <Box flex={1}>
            <KeyValueDisplay marginBottom={1.5} kkey="24-Hour Volume" ValueComponent="span" className={classes.keyDisplay}>
              <Box mt={1}>
                <Text variant="h4">
                  <span className={classes.titleColoured}>{(swapVolumes[token.address]?.totalZilVolume || BIG_ZERO).shiftedBy(-12).dp(0).toFormat()}</span> ZIL
                </Text>
                <Text className={classes.label}>
                  ${totalZilVolumeUSD?.dp(0).toFormat()}
                </Text>
              </Box>
            </KeyValueDisplay>
          </Box>
          <Box flex={3} display="flex">
            {!walletState.wallet && (
              <Box>
                <KeyValueDisplay marginBottom={1.5} kkey="Your Stake" ValueComponent="span" className={classes.keyDisplay}>
                  <Box display="flex" alignItems="center" mt={1}>
                    <ConnectWalletButton connectText="Connect Wallet" /><Text color="textSecondary" variant="h4">to view.</Text>
                  </Box>
                </KeyValueDisplay>
              </Box>
            )}
            {walletState.wallet && !poolShare.isZero() && (
              <>
                <Box flex={3}>
                  <KeyValueDisplay marginBottom={1.5} kkey="Your Stake" ValueComponent="span" className={classes.keyDisplay}>
                    <Box display="flex" flexDirection="column" mt={1}>
                      <Text variant="h4" className={classes.stakeText}>
                        <span className={classes.textColoured}>{tokenAmount}</span> {token.symbol}  <ViewHeadline className={classes.viewIcon} /><span className={classes.textColoured}>{zilAmount}</span> ZIL
                      </Text>
                      <Text className={classes.label}>
                        {poolShareLabel}%
                      </Text>
                    </Box>
                  </KeyValueDisplay>
                </Box>
                <Box flex={2}>
                  <KeyValueDisplay marginBottom={1.5} kkey="Your Expected Reward" ValueComponent="span" className={classes.keyDisplay}>
                    <Box display="flex" flexDirection="column" mt={1}>
                      {
                        potentialRewards.flatMap(reward => {
                          const rewardToken = tokenState.tokens[reward.tokenAddress]
                          if (!rewardToken) return []
                          return [
                            <Text variant="h4">
                              <span className={classes.textColoured}>{reward.amount.shiftedBy(-rewardToken.decimals).dp(5).toFormat()}</span> {rewardToken.symbol}
                            </Text>
                          ]
                        })
                      }
                    </Box>
                  </KeyValueDisplay>
                </Box>
              </>
            )}
          </Box>
          {/* <Box marginBottom={1} display="flex" flexDirection="column" className={classes.liquidityVolumeContainer}>
            <KeyValueDisplay marginBottom={1.5} kkey="Total Liquidity" ValueComponent="span">
              <Text className={classes.label}>${usdValues?.poolLiquidity.dp(0).toFormat()}</Text>
            </KeyValueDisplay>
            <KeyValueDisplay marginBottom={1.5} kkey="24-Hour Volume" ValueComponent="span">
              <Text align="right" className={classes.label}>
                <span className={classes.textColoured}>{(swapVolumes[token.address]?.totalZilVolume || BIG_ZERO).shiftedBy(-12).dp(0).toFormat()}</span> ZIL
                (${totalZilVolumeUSD?.dp(0).toFormat()})
              </Text>
            </KeyValueDisplay>
            {
              !poolShare.isZero() &&
              <KeyValueDisplay marginBottom={1.5} kkey={`Your Pool Share (${poolShareLabel}%)`} ValueComponent="span">
                <Text align="right" className={classes.label}>
                  <span className={classes.textColoured}>{tokenAmount}</span> {token.symbol} + <span className={classes.textColoured}>{zilAmount}</span> ZIL
                  (${toHumanNumber(depositedValue, 2)})
                </Text>
              </KeyValueDisplay>
            }
            {
              potentialRewards.flatMap(reward => {
                const rewardToken = tokenState.tokens[reward.tokenAddress]
                if (!rewardToken) return []
                return [
                  <KeyValueDisplay key={token.address} marginBottom={1.5} kkey="Your Estimated Rewards" ValueComponent="span">
                    <Text align="right" className={classes.label}>
                      <span className={classes.textColoured}>{reward.amount.shiftedBy(-rewardToken.decimals).dp(5).toFormat()}</span> {rewardToken.symbol}
                    </Text>
                  </KeyValueDisplay>
                ]
              })
            }
          </Box> */}
        </CardContent>
      )}
    </Card >
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    borderRadius: 12,
    boxShadow: theme.palette.cardBoxShadow,
    border: theme.palette.border,
    backgroundColor: "transparent",
    "& .MuiCardContent-root:last-child": {
      paddingBottom: 0
    }
  },
  title: {
    padding: theme.spacing(0, 4),
    paddingTop: theme.spacing(2)
  },
  poolIcon: {
    marginRight: theme.spacing(2),
  },
  content: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(3),
    "&.MuiCardContent-root:last-child": {
      paddingBottom: theme.spacing(3),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  extraContent: {
    display: "flex",
    alignItems: "flex-start",
    padding: theme.spacing(3),
    "&.MuiCardContent-root:last-child": {
      paddingBottom: theme.spacing(3),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0, 2),
    },
  },
  rewardValue: {
    fontSize: 22,
    lineHeight: "24px",
    fontWeight: "bold",
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px',
      lineHeight: '16px',
    },
    color: theme.palette.text?.primary,
  },
  rewardContainer: {
    [theme.breakpoints.down("sm")]: {
      alignItems: "center"
    },
  },
  roiContainer: {
    alignItems: "baseline",
    justifyContent: "flex-end",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-end",
    },
  },
  roiValue: {
    fontSize: 12,
    lineHeight: "12px",
    display: "flex",
    alignItems: "center",
  },
  roiNumber: {
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.dark,
    fontWeight: 700,
  },
  thinSubtitle: {
    fontWeight: 400,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  dropdown: {
    "& .MuiMenu-list": {
      padding: theme.spacing(.5),
    },
  },
  dropdownItem: {
    borderRadius: theme.spacing(.5),
    minWidth: theme.spacing(15),
  },
  statContainer: {
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  statItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing(1),
      "& $rewardContainer": {
        alignItems: "flex-start",
      },
    },
  },
  titleColoured: {
    color: theme.palette.type === "dark" ? "#00FFB0" : `rgba${hexToRGBA("#003340", 0.5)}`
  },
  addIcon: {
    color: theme.palette.text?.secondary,
    height: "16px",
    width: "16px",
    marginRight: theme.spacing(0.2)
  },
  viewIcon: {
    color: theme.palette.type === "dark" ? "#00FFB0" : `rgba${hexToRGBA("#003340", 0.5)}`,
    fontSize: 14,
  },
  box: {
    backgroundColor: theme.palette?.currencyInput,
    border: `3px solid rgba${hexToRGBA("#00FFB0", 0.2)}`,
    margin: "2px",
  },
  token: {
    fontSize: 22,
    lineHeight: "24px",
    [theme.breakpoints.down("md")]: {
      fontSize: 16,
    },
    marginLeft: theme.spacing(0.5)
  },
  poolSize: {
    fontSize: 22,
    lineHeight: "24px",
    fontWeight: "bold",
    [theme.breakpoints.down("md")]: {
      fontSize: 18,
    },
    color: theme.palette.primary.dark,
  },
  rewardTokenLogo: {
    marginLeft: theme.spacing(.5),
    height: 26,
    width: 26,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: theme.spacing(1.8),
      marginLeft: 0
    },
  },
  divider: {
    transform: "skew(0, -45deg)",
    maxWidth: 30,
    marginLeft: 15,
    borderBottom: theme.palette.type === "dark" ? "1px solid transparent" : `1px solid rgba${hexToRGBA("#003340", 0.5)}`,
    borderImage: theme.palette.type === "dark"
      ? "linear-gradient(to left, #003340 1%, #00FFB0  50%, #003340 100%) 0 0 100% 0/0 0 1px 0 stretch"
      : "",
  },
  label: {
    marginTop: theme.spacing(.5),
    color: theme.palette.label
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  liquidityVolumeContainer: {
    padding: theme.spacing(0, 3),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 1),
    },
  },
  logo: {
    height: 27,
    width: 27,
    marginRight: 3,
    [theme.breakpoints.down("xs")]: {
      height: 23,
      width: 23
    },
  },
  detailButton: {
    padding: theme.spacing(2, 3),
    color: theme.palette.text?.primary,
    borderRadius: 12,
    fontWeight: 500,
  },
  addLiquidity: {
    backgroundColor: "#FFDF6B",
    color: "#003340",
    padding: theme.spacing(2, 4),
    borderRadius: theme.spacing(1.5),
  },
  selectedCard: {
    backgroundColor: "#DEFFFF18",
    borderRadius: theme.spacing(1.5),
  },
  keyDisplay: {
    flexDirection: "column",
    padding: theme.spacing(1, 1, 0, 1),
    "&.MuiBox-root": {
      marginBottom: 0,
    }
  },
  stakeText: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  currencyReward: {
    display: "flex",
    fontSize: 12,
    alignItems: "center",
  }
}));

export default PoolInfoCard;
