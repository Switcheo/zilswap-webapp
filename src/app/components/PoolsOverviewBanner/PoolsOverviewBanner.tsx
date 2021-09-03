import { Box, BoxProps, Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { StatsCard, Text } from "app/components";
import { RewardsState, RootState, StatsState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useValueCalculators, useNetwork } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import cls from "classnames";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HelpInfo from "../HelpInfo";
import CurrencyLogo from "../CurrencyLogo";

interface Props extends BoxProps { }

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  banner: {
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    padding: theme.spacing(4, 4),
    borderRadius: 12,
    boxShadow: theme.palette.cardBoxShadow,
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 0),
    },
  },
  statistic: {
    fontSize: theme.spacing(4),
    lineHeight: `${theme.spacing(4)}px`,
    fontWeight: 700,
    color: theme.palette.primary.dark
  },
  subtitle: {
    minHeight: theme.spacing(3),
  },
  helpIcon: {
    verticalAlign: "middle",
    marginLeft: theme.spacing(1),
  },
  helpInfo: {
    marginBottom: theme.spacing(0.3)
  },
  percentagePositive: {
    color: theme.palette.primary.dark,
  },
  percentageNegative: {
    color: "#FF5252"
  },
  currencyLogo: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    height: "30px",
    width: "30px"
  },
  reward: {
    display: "inline-flex"
  },
  currency: {
    color: theme.palette.text?.primary
  }
}));

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const PoolsOverviewBanner: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const network = useNetwork();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const rewardsState = useSelector<RootState, RewardsState>(state => state.rewards);
  const statsState = useSelector<RootState, StatsState>(state => state.stats);
  const valueCalculators = useValueCalculators();
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const classes = useStyles();

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);

    // eslint-disable-next-line
  }, [rewardsState.distributors]);

  const { totalLiquidity, liquidityChangePercent } = React.useMemo(() => {

    const totalLiquidity = Object.values(tokenState.tokens).reduce((accum, token) => {
      // TODO: proper token blacklist
      if (token.address === "zil13c62revrh5h3rd6u0mlt9zckyvppsknt55qr3u")
        return accum;
      const poolValue = tokenState.values[token.address]?.poolLiquidity ?? BIG_ZERO;
      return accum.plus(poolValue);
    }, BIG_ZERO);

    const previousLiquidity = Object.values(tokenState.tokens).reduce((accum, token) => {
      const liquidityChange = statsState.liquidityChange24h[token.address] ?? BIG_ZERO;
      const totalContribution = bnOrZero(token.pool?.totalContribution);
      const previousContribution = totalContribution.minus(liquidityChange);
      if (previousContribution.isZero()) return accum;

      const factor = previousContribution.div(totalContribution);
      const poolValue = valueCalculators.pool(tokenState.prices, token).times(factor);
      return accum.plus(poolValue);
    }, BIG_ZERO);

    const liquidityChangePercent = previousLiquidity.isZero() ? BIG_ZERO : bnOrZero((totalLiquidity.minus(previousLiquidity)).div(previousLiquidity).shiftedBy(2));

    return {
      totalLiquidity,
      liquidityChangePercent,
    };

  }, [tokenState, valueCalculators, statsState.liquidityChange24h]);

  const updateCountdown = () => {
    if (rewardsState.distributors.length === 0) return

    const currentTime = dayjs();
    const endEpoch = dayjs.unix(Math.min(...rewardsState.distributors.map(d => d.currentEpochEnd)))
    const diffSeconds = Math.max(0, endEpoch.diff(currentTime, 'seconds'))
    const days = Math.floor(diffSeconds / 86400);
    const hours = Math.floor((diffSeconds % 86400) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    setCountdown({
      days: `0${days}`.substr(-2),
      hours: `0${hours}`.substr(-2),
      minutes: `0${minutes}`.substr(-2),
      seconds: `0${seconds}`.substr(-2),
    });
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.banner}>
        <Container maxWidth="lg">
          <Text marginBottom={4} variant="h2">Overview</Text>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StatsCard heading="Total Value Locked">
                <Text marginBottom={2} variant="h1" className={classes.statistic}>${totalLiquidity.toFormat(2)}</Text>
                <Box display="flex" flexDirection="row" alignItems="center" className={classes.subtitle}>
                  {
                    <Text className={liquidityChangePercent.gte(0) ? classes.percentagePositive : classes.percentageNegative}>
                      ({`${liquidityChangePercent.gt(0) ? "+" : ""}${liquidityChangePercent.toFormat(2)}%`})
                    </Text>
                  }
                </Box>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard heading={(
                <Box display="flex" justifyContent="space-between">
                  <span>
                    Rewards to be Distributed
                  </span>
                  <HelpInfo className={classes.helpInfo} placement="top" title="Rewards are distributed weekly, every Wednesday, to liquidity providers of eligible token pools." />
                </Box>
              )}>
                <Text marginBottom={2} variant="h1" className={cls(classes.statistic, classes.reward)}>
                  {'-'}
                  <CurrencyLogo currency="ZWAP" address={ZWAP_TOKEN_CONTRACT[network]} className={classes.currencyLogo}/>
                  <span className={classes.currency}>
                    ZWAP
                  </span>
                </Text>
                <Box alignItems="center" display="flex" className={classes.subtitle}>
                  <Text>
                    Per Week
                  </Text>
                </Box>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard heading="Countdown to Next Reward Distribution">
                <Box display="flex">
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.days ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text>Days</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.hours ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text>Hours</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.minutes ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text>Minutes</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.seconds ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text>Seconds</Text>
                    </Box>
                  </Box>
                </Box>
              </StatsCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default PoolsOverviewBanner;
