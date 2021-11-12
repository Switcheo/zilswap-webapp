import React, { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, CardProps, Chip, Divider, Popover } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowDropUp, ArrowDropDown, Visibility } from "@material-ui/icons";
import cls from "classnames";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import groupBy from "lodash/groupBy";
import { toBech32Address } from "@zilliqa-js/crypto";
import { KeyValueDisplay, Text, FancyButton, PoolLogo } from "app/components";
import { actions } from "app/store";
import { EMPTY_USD_VALUE } from "app/store/token/reducer";
import { PoolSwapVolumeMap, RewardsState, RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, toHumanNumber, useNetwork, useValueCalculators } from "app/utils";
import { BIG_ONE, BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";

interface Props extends CardProps {
  token: TokenInfo;
}

const PoolMobileInfoCard: React.FC<Props> = (props: Props) => {
  const { children, className, token, ...rest } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const valueCalculators = useValueCalculators();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const swapVolumes = useSelector<RootState, PoolSwapVolumeMap>(state => state.stats.dailySwapVolumes);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const network = useNetwork();
  const classes = useStyles();
  const [showDetail, setShowDetail] = useState(false);
  const [rewardsAnchor, setRewardsAnchor] = useState<HTMLButtonElement | null>(null);

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
      roi: roiPerDay.isZero() || roiPerDay.isNaN() ? "-" : `${roiPerDay.toFormat()}%`,
      apr: apr.isZero() || apr.isNaN() ? '-' : `${toHumanNumber(apr, 1)}%`,
      preStartDistributors
    };
  }, [rewardsState.rewardsByPool, rewardsState.distributors, token, usdValues]);


  if (token.isZil) return null;

  const decimals = token.address === ZIL_ADDRESS ? 12 : (token.decimals ?? 0);

  const poolShare = token.pool?.contributionPercentage.shiftedBy(-2) ?? BIG_ZERO;
  const poolShareLabel = poolShare.shiftedBy(2).decimalPlaces(3).toString(10) ?? "";
  const tokenAmount = toHumanNumber(poolShare.times(token.pool?.tokenReserve ?? BIG_ZERO).shiftedBy(-decimals));
  const zilAmount = toHumanNumber(poolShare.times(token.pool?.zilReserve ?? BIG_ZERO).shiftedBy(-12));
  const depositedValue = poolShare.times(usdValues?.poolLiquidity ?? BIG_ZERO);

  const potentialRewards = rewardsState.potentialRewardsByPool[token.address] || [];

  const openRewards = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setRewardsAnchor(ev.currentTarget);
  }

  const closeRewards = () => {
    setRewardsAnchor(null)
  }

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <CardContent className={classes.title}>
        <Box display="flex" alignItems="center">
          <PoolLogo noBg={true} className={classes.poolIcon} pair={[token.symbol, "ZIL"]} tokenAddress={token.address} noOverlap={true} /><Text variant="h6">{token.symbol} - ZIL</Text>
        </Box>
      </CardContent>


      <Box className={classes.dividerBox}>
        <Divider className={classes.divider} />
      </Box>

      <CardContent className={classes.content}>
        <KeyValueDisplay wrapLabel={true} kkey="Total Stake" ValueComponent="span">
          <Box>
            <Text variant="h4" className={classes.flexText}><Text variant="h4" className={classes.textColoured}>{toHumanNumber(token.pool?.tokenReserve.shiftedBy(-decimals), 2)}</Text>&nbsp;{token.symbol}</Text>
            <Text variant="h4" className={classes.flexText}><Text variant="h4" className={classes.textColoured}>{toHumanNumber(token.pool?.zilReserve.shiftedBy(-12), 2)}</Text>&nbsp;ZIL</Text>
          </Box>
        </KeyValueDisplay>

        <KeyValueDisplay wrapLabel={true} kkey="Rewards to be Distributed" ValueComponent="span" mt={2}>
          <Text variant="h4" color="textPrimary">
            {
              poolRewards.length > 0 ?
                "$" + Object.entries(groupBy(poolRewards, (reward) => reward.rewardToken.address))
                  .filter(([address, rewards]) => {
                    return !preStartDistributors?.find(distributor => toBech32Address(distributor.reward_token_address_hex) === address)
                  })
                  .reduce((total, [address, rewards]) =>
                    total.plus(rewards.reduce((acc, reward) =>
                      acc.plus(reward.amountPerEpoch), BIG_ZERO).shiftedBy(-rewards[0].rewardToken.decimals).times(tokenState.prices[address] || BIG_ONE)), BIG_ZERO)
                  .toFormat(2)
                :
                "-"
            }
          </Text>

          {poolRewards.length > 0 && (
            <Box display="flex" justifyContent="flex-end">
              <Button onClick={(ev) => openRewards(ev)} className={classes.moreText}>More&nbsp;<Visibility fontSize="small" /></Button>
              <Popover
                open={Boolean(rewardsAnchor)}
                anchorEl={rewardsAnchor}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                onClose={closeRewards}
                className={classes.rewardPopper}
              >
                {Object.entries(groupBy(poolRewards, (reward) => reward.rewardToken.address))
                  .filter(([address, rewards]) => {
                    return !preStartDistributors?.find(distributor => toBech32Address(distributor.reward_token_address_hex) === address)
                  })
                  .map(([address, rewards]) => {
                    return (
                      <Text variant="body2" color="textPrimary" className={classes.currencyReward}>
                        <Text className={classes.textColoured}>
                          {rewards.reduce((acc, reward) => acc.plus(reward.amountPerEpoch), BIG_ZERO)
                            .shiftedBy(-rewards[0].rewardToken.decimals).toFormat(2)}
                        </Text>&nbsp;{rewards[0].rewardToken.symbol}&nbsp;<Text className={classes.halfOpacity}>{(rewards[0].rewardToken.isZil || rewards[0].rewardToken.isZwap) ? "by ZilSwap" : `by ${rewards[0].rewardToken.symbol}`}</Text>
                      </Text>
                    )
                  })}
              </Popover>
            </Box>
          )}
        </KeyValueDisplay>

        {/* <Box p={3} pt={2} pb={0}>
        <KeyValueDisplay wrapLabel={true} kkey="Rewards to be Distributed" ValueComponent="span">
          {
            poolRewards.length > 0 ?
              Object.entries(groupBy(poolRewards, (reward) => reward.rewardToken.address)).map(([address, rewards]) => {
                return (
                  <Text variant="h4" className={classes.flexText}><Text variant="h4" className={classes.textColoured}>{rewards.reduce((acc, reward) => acc.plus(reward.amountPerEpoch), BIG_ZERO).shiftedBy(-rewards[0].rewardToken.decimals).toFormat(2)}</Text>&nbsp;{rewards[0].rewardToken.symbol}</Text>
                )
              })
              :
              <Text color="textPrimary" className={classes.rewardValue}>
                -
              </Text>
          }

          <Text variant="h4" className={classes.flexText}><Text variant="h4" className={classes.textColoured}>{toHumanNumber(token.pool?.zilReserve.shiftedBy(-12), 2)}</Text>&nbsp;ZIL</Text>
        </KeyValueDisplay>
      </Box > */}

        <KeyValueDisplay wrapLabel={true} kkey="APR" ValueComponent="span" mt={2}>
          <Text variant="h4" className={classes.flexText}><Text variant="h4" >{apr}</Text><Text variant="h4" className={classes.boldless}>(Daily ROI {roi})</Text></Text>
        </KeyValueDisplay>


        <Box display="flex" alignItems="center" mt={2}>
          <Text variant="h4" className={cls(classes.detailSelect, { [classes.textColoured]: !!showDetail })} onClick={() => setShowDetail(!showDetail)} >Details {showDetail ? <ArrowDropUp /> : <ArrowDropDown />}</Text>
          <Box flexGrow={1} />
          <Box flex={1.5} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
            <FancyButton onClick={() => onGotoAddLiquidity()} className={classes.addLiquidity}>Add Liquidity</FancyButton>
            {poolRewards.length > 1 && (<Chip label={`${token.whitelisted ? "CORE // " : ""} ${poolRewards.length}x Drops`} className={cls(classes.coreDropChip, { [classes.coreDrop]: token.whitelisted })} />)}
          </Box>
        </Box>

        {showDetail && <Box className={classes.detailBox}>
          <KeyValueDisplay wrapLabel={true} kkey="Total Liquidity" ValueComponent="span">
            <Text variant="h4" >${usdValues?.poolLiquidity.dp(0).toFormat()}</Text>
          </KeyValueDisplay>
          <KeyValueDisplay wrapLabel={true} kkey="24H Volume" ValueComponent="span" mt={.5}>
            <Box display="flex" flexDirection="column" textAlign="end">
              <Text variant="h4">
                <span className={classes.titleColoured}>{(swapVolumes[token.address]?.totalZilVolume || BIG_ZERO).shiftedBy(-12).dp(0).toFormat()}</span> ZIL
              </Text>
              <Text className={classes.label}>
                ${totalZilVolumeUSD?.dp(0).toFormat()}
              </Text>
            </Box>
          </KeyValueDisplay>
          {walletState.wallet && !poolShare.isZero() && <Box my={1}>
            <KeyValueDisplay marginBottom={1.5} kkey="Your Stake" ValueComponent="span">
              <Box display="flex" flexDirection="column" textAlign="end">
                <Text variant="h4">
                  <span className={classes.textColoured}>{tokenAmount}</span> {token.symbol}
                </Text>
                <Text variant="h4">
                  <span className={classes.textColoured}>{zilAmount}</span> ZIL
                </Text>
                <Text className={classes.label}>
                  ${depositedValue.toFormat(2) || "-"} ({poolShareLabel || "-"}%)
                </Text>
              </Box>
            </KeyValueDisplay>
            <KeyValueDisplay marginBottom={1.5} kkey="Your Expected Rewards" ValueComponent="span" wrapLabel={true}>
              <Box display="flex" flexDirection="column">
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
          </Box>}
        </Box>}
      </CardContent>
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
    padding: theme.spacing(2),
  },
  poolIcon: {
    marginRight: theme.spacing(2),
  },
  content: {
    padding: theme.spacing(2),
    "&.MuiCardContent-root:last-child": {
      paddingBottom: theme.spacing(2),
    }
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
  dropdown: {
    "& .MuiMenu-list": {
      padding: theme.spacing(.5),
    },
  },
  titleColoured: {
    color: theme.palette.type === "dark" ? "#00FFB0" : `rgba${hexToRGBA("#003340", 0.5)}`
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
  dividerBox: {
  },
  divider: {
    borderBottom: theme.palette.type === "dark" ? "1px solid transparent" : `1px solid rgba${hexToRGBA("#003340", 0.5)}`,
    borderImage: theme.palette.type === "dark"
      ? "linear-gradient(to left, #003340 1%, #00FFB0  50%, #003340 100%) 0 0 100% 0/0 0 1px 0 stretch"
      : "",
  },
  label: {
    color: theme.palette.label,
    fontWeight: 400
  },
  textColoured: {
    color: theme.palette.primary.dark,
    fontSize: "inherit",
  },
  flexText: {
    display: "flex",
    justifyContent: "flex-end",
  },
  boldless: {
    fontWeight: 400,
  },
  detailSelect: {
    color: theme.palette.text?.primary,
    borderRadius: 12,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
  },
  addLiquidity: {
    backgroundColor: "#FFDF6B",
    color: "#003340",
    padding: theme.spacing(2, 4),
    borderRadius: theme.spacing(1.5),
  },
  detailBox: {
    backgroundColor: "#002A34",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : `1px solid rgba${hexToRGBA("#003340", 0.5)}`,
    borderRadius: 12,
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
  },
  moreText: {
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    transform: "translateX(16px)",
    color: theme.palette.text?.primary
  },
  currencyReward: {
    display: "flex",
    fontSize: 15,
    alignItems: "center",
  },
  rewardPopper: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.background.default,
      borderRadius: "12px",
      border: theme.palette.border,
      overflow: "hidden",
      marginTop: 8,
      padding: theme.spacing(1.5),
    },
    "& .MuiTypography-root": {
      lineHeight: 1.3,
      fontWeight: 500
    }
  },
  halfOpacity: {
    opacity: 0.5
  },
  coreDropChip: {
    position: "absolute",
    transform: "translateY(26px)",
    minWidth: 120,
    height: 24,
    padding: theme.spacing(.5, 0),
    backgroundColor: "#3290FF",
    color: "#DEFFFF",
    fontFamily: "Raleway"
  },
  coreDrop: {
    backgroundColor: "#7B61FF",
  }
}));


export default PoolMobileInfoCard;
