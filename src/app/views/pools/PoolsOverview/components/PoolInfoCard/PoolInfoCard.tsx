import { Box, Button, Card, CardContent, CardProps, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Add, ViewHeadline } from "@material-ui/icons";
import { CurrencyLogo, HelpInfo, KeyValueDisplay, Text } from "app/components";
import { actions } from "app/store";
import { EMPTY_USD_VALUE } from "app/store/token/reducer";
import { PoolSwapVolumeMap, RewardsState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useNetwork, useValueCalculators } from "app/utils";
import { BIG_ZERO, ZIL_ADDRESS } from "app/utils/constants";
import { bnOrZero, toHumanNumber } from "app/utils/strings/strings";
import cls from "classnames";
import { ZWAPRewards } from "core/zwap";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";

interface Props extends CardProps {
  token: TokenInfo;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    borderRadius: 12,
    boxShadow: theme.palette.cardBoxShadow,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
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
    padding: theme.spacing(0, 3),
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
    color: theme.palette.primary.dark,
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
    alignItems: "center",
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
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: "-12px",
    marginTop: "-12px"
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
    marginBottom: theme.spacing(1)
  },
  zwapLogo: {
    marginLeft: theme.spacing(.5),
    [theme.breakpoints.down("sm")]: {
      paddingBottom: theme.spacing(1.8),
      marginLeft: 0
    },
  },
  dividerBox: {
    margin: theme.spacing(3, 0),
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(1)
    },
  },
  divider: {
    borderBottom: theme.palette.type === "dark" ? "1px solid transparent" : `1px solid rgba${hexToRGBA("#003340", 0.5)}`,
    borderImage: theme.palette.type === "dark"
                  ? "linear-gradient(to left, #003340 1%, #00FFB0  50%, #003340 100%) 0 0 100% 0/0 0 1px 0 stretch"
                  : "",
  },
  label: {
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
    [theme.breakpoints.down("xs")]: {
      height: "24px",
      width: "24px"
    },
  }
}));

const ZWAP_TOKEN_ADDRESS = "zil1p5suryq6q647usxczale29cu3336hhp376c627";

const PoolInfoCard: React.FC<Props> = (props: Props) => {
  const { children, className, token, ...rest } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const valueCalculators = useValueCalculators();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const swapVolumes = useSelector<RootState, PoolSwapVolumeMap>(state => state.stats.dailySwapVolumes)
  const network = useNetwork();
  const classes = useStyles();

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
    potentialRewards,
    // rewardsValue,
    roiLabel,
    apr,
  } = React.useMemo(() => {
    if (!rewardsState.epochInfo) return {
      rewardsValue: BIG_ZERO,
      potentialRewards: BIG_ZERO,
      roiLabel: "-",
      apr: BIG_ZERO,
    };

    const poolRewards = bnOrZero(rewardsState.rewardByPools[token.address]?.weeklyReward);

    const zapContractAddr = ZWAPRewards.TOKEN_CONTRACT[network];
    const zapToken = tokenState.tokens[zapContractAddr];

    const rewardsValue = valueCalculators.amount(tokenState.prices, zapToken, poolRewards.shiftedBy(12));
    const roiPerEpoch = rewardsValue.dividedBy(usdValues.poolLiquidity);
    const epochsPerYear = 52
    const apr = bnOrZero(roiPerEpoch.times(epochsPerYear).shiftedBy(2).decimalPlaces(1));
    const epochDuration = rewardsState.epochInfo.raw.epoch_period;
    const secondsInDay = 24 * 3600;
    const roiPerDay = bnOrZero(roiPerEpoch.dividedBy(epochDuration).times(secondsInDay).shiftedBy(2).decimalPlaces(2));

    return {
      potentialRewards: poolRewards,
      rewardsValue,
      roiLabel: roiPerDay.isZero() ? "0%" : `${roiPerDay.toFormat()}%`,
      apr,
    };
  }, [network, rewardsState.epochInfo, rewardsState.rewardByPools, token, usdValues, tokenState.prices, tokenState.tokens, valueCalculators]);


  if (token.isZil) return null;

  const decimals = token.symbol === "ZIL" ? 12 : (token.decimals ?? 0);

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <CardContent className={classes.title}>
        <Box display="flex" alignItems="center">
          {/* <PoolLogo className={classes.poolIcon} pair={[token.symbol, "ZIL"]} tokenAddress={token.address} /> */}
          <Text variant="h6">{token.symbol} <span className={classes.titleColoured}>-</span> ZIL <span className={classes.titleColoured}>POOL</span></Text>
          <Box flex={1} />
          <Button onClick={onGotoAddLiquidity}>
            <Add className={classes.addIcon} />
            <Text color="textSecondary" variant="body1">Add Liquidity</Text>
          </Button>
        </Box>
      </CardContent>

      <CardContent className={classes.content}>
        <Box mt={1.5} mb={2} display="flex" bgcolor="background.contrast" padding={0.5} borderRadius={12} position="relative">
          <Box className={classes.box} display="flex" flexDirection="column" alignItems="start" flex={1} borderRadius={12}>
              <Box py={"4px"} px={"16px"}>
                <Box display="flex" alignItems="flex-end" mt={1} mb={1}>
                  <CurrencyLogo className={classes.logo} currency={token.symbol} address={token.address} />
                  <Text className={classes.token}>{token.symbol}</Text>
                </Box>
                <Text className={classes.poolSize}>{toHumanNumber(token.pool?.tokenReserve.shiftedBy(-decimals), 2)}</Text>
            </Box>
          </Box>
          <ViewHeadline className={classes.viewIcon}/>
          <Box className={classes.box} display="flex" flexDirection="column" flex={1} borderRadius={12}>
            <Box py={"4px"} px={"16px"}>
                <Box mt={1} mb={1} display="flex" justifyContent="space-between">
                  <Box display="flex" alignItems="flex-end">
                    <CurrencyLogo className={classes.logo} currency="ZIL" address={token.address} />
                    <Text className={classes.token}>ZIL</Text>
                  </Box>
                  <HelpInfo placement="top" title={`This shows the current ${token.symbol}-ZIL pool size.`}/>
                </Box>
                <Text className={classes.poolSize}>{toHumanNumber(token.pool?.zilReserve.shiftedBy(-12), 2)}</Text>
            </Box>
          </Box>
        </Box>

        <Box display="flex" className={classes.statContainer} px={1}>
          <Box display="flex" className={classes.statItem}>
            <Text variant="subtitle2" marginBottom={1.5}>Reward to be Distributed</Text>
            <Box display="flex" className={classes.rewardContainer} alignItems="flex-end" flexWrap="wrap">
              <Text variant="h1" color="textPrimary" className={classes.rewardValue}>
                {potentialRewards.isZero() ? "0" : potentialRewards.toFormat()}
              </Text>
              <CurrencyLogo className={classes.zwapLogo} currency="ZWAP" address={ZWAP_TOKEN_ADDRESS} />
            </Box>
          </Box>

          <Box display="flex" className={classes.statItem}>
            <Text align="right" variant="subtitle2" marginBottom={1.5}>Daily ROI</Text>
            <Box display="flex" className={classes.roiContainer}>
              <Text color="textPrimary" className={classes.rewardValue}>
                {roiLabel}
              </Text>
            </Box>
          </Box>

          <Box display="flex" className={classes.statItem}>
            <Text align="right" variant="subtitle2" marginBottom={1.5}>APR</Text>
            <Box display="flex" className={classes.roiContainer}>
              <Text color="textPrimary" className={classes.rewardValue}>
                {!apr.isZero() && (
                  <span>{toHumanNumber(apr, 1)}%</span>
                )}
                {apr.isZero() && (
                  <span>0%</span>
                )}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box className={classes.dividerBox}>
          <Divider className={classes.divider}/>
        </Box>

        <Box display="flex" flexDirection="column" className={classes.liquidityVolumeContainer}>
          <KeyValueDisplay marginBottom={2.25} kkey="Total Liquidity" ValueComponent="span">
            <Text className={classes.label}>${usdValues?.poolLiquidity.dp(0).toFormat()}</Text>
          </KeyValueDisplay>
          <KeyValueDisplay marginBottom={2.25} kkey="24-Hour Volume" ValueComponent="span">
            <Text align="right" className={classes.label}>
              <span className={classes.textColoured}>{swapVolumes[token.address]?.totalZilVolume.shiftedBy(-12).dp(0).toFormat()} ZIL</span> (${totalZilVolumeUSD?.dp(0).toFormat()})
            </Text>
          </KeyValueDisplay>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PoolInfoCard;
