import { Box, BoxProps, Container, Grid, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowDropUpRounded } from "@material-ui/icons";
import { StatsCard, Text } from "app/components";
import { RewardsState, RootState, StatsState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useValueCalculators } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import cls from "classnames";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ReactComponent as TooltipSVG } from "./tooltip.svg";

interface Props extends BoxProps { }

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  banner: {
    backgroundColor: theme.palette.toolbar.main,
    padding: theme.spacing(6, 0),
  },
  statistic: {
    fontSize: theme.spacing(4),
    lineHeight: `${theme.spacing(4)}px`,
    fontWeight: 700,
  },
  subtitle: {
    minHeight: theme.spacing(3),
  },
  subtitleIcon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  helpIcon: {
    verticalAlign: "middle",
    marginLeft: theme.spacing(1),
  },
}));

interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const PoolsOverviewBanner: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
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
  }, [rewardsState.epochInfo]);

  const { totalLiquidity, liquidityChangePercent } = React.useMemo(() => {

    const totalLiquidity = Object.values(tokenState.tokens).reduce((accum, token) => {
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

  const nextRewards = useMemo(() => {
    if (!rewardsState.epochInfo) return BIG_ZERO;
    return bnOrZero(rewardsState.epochInfo.raw.tokens_per_epoch);
  }, [rewardsState.epochInfo])

  const updateCountdown = () => {
    if (!rewardsState.epochInfo) return setCountdown(null);

    const nextEpoch = rewardsState.epochInfo.nextEpoch;
    const currentTime = dayjs();
    const diffSeconds = Math.max(0, nextEpoch.unix() - currentTime.unix()) % rewardsState.epochInfo.raw.epoch_period;
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

  const epochInfo = rewardsState.epochInfo;

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.banner}>
        <Container maxWidth="lg">
          <Text marginBottom={4} variant="h1">Overview</Text>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StatsCard heading="Total Value Locked">
                <Text marginBottom={2} variant="h1" className={classes.statistic}>${totalLiquidity.toFormat(2)}</Text>
                <Box display="flex" flexDirection="row" alignItems="center">
                  <ArrowDropUpRounded className={classes.subtitleIcon} color="primary" />
                  <Text color="primary">{liquidityChangePercent.toFormat(2)}%</Text>
                </Box>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard heading={(
                <span>
                  ZWAP next epoch
                  <Tooltip title="Click to learn more about ZWAP rewards">
                    <a href="https://blog.switcheo.network/introducing-zwap/" target="_blank" rel="noopener noreferrer">
                      <TooltipSVG className={classes.helpIcon} />
                    </a>
                  </Tooltip>
                </span>
              )}>
                <Text marginBottom={2} variant="h1" className={classes.statistic}>
                  {nextRewards.toFormat(0)}
                </Text>
                <Box alignItems="center" display="flex" className={classes.subtitle}>
                  {!!epochInfo && epochInfo.current < epochInfo.maxEpoch && (
                    <Text color="textSecondary">
                      until next epoch
                    </Text>
                  )}

                  {!!epochInfo && epochInfo.current >= epochInfo.maxEpoch && (
                    <Text color="textSecondary">
                      All ZWAP rewards distributed
                    </Text>
                  )}
                </Box>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard heading="Countdown to next epoch">
                <Box display="flex">
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.days ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text color="textSecondary">days</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.hours ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text color="textSecondary">hours</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.minutes ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text color="textSecondary">minutes</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic}>
                      {countdown?.seconds ?? "-"}
                    </Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text color="textSecondary">seconds</Text>
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
