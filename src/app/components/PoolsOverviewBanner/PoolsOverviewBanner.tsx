import { Box, BoxProps, Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowDropUpRounded } from "@material-ui/icons";
import { StatsCard, Text } from "app/components";
import { RewardsState, RootState, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useValueCalculators } from "app/utils";
import { BIG_ZERO } from "app/utils/contants";
import cls from "classnames";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

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
  const valueCalculators = useValueCalculators();
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const classes = useStyles();

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);

    // eslint-disable-next-line
  }, [rewardsState.epochInfo]);

  const { totalLiquidity } = React.useMemo(() => {

    const totalLiquidity = Object.values(tokenState.tokens).reduce((accum, token) => {
      const poolValue = valueCalculators.pool(tokenState.prices, token);
      return accum.plus(poolValue);
    }, BIG_ZERO);

    return {
      totalLiquidity,
    };

  }, [tokenState, valueCalculators]);

  const updateCountdown = () => {
    if (!rewardsState.epochInfo) return setCountdown(null);

    const nextEpoch = rewardsState.epochInfo.nextEpoch;
    const currentTime = moment();
    const diffSeconds = Math.max(0, nextEpoch.unix() - currentTime.unix());
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
          <Text marginBottom={4} variant="h1">Overview</Text>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StatsCard heading="Total Value Locked">
                <Text marginBottom={2} variant="h1" className={classes.statistic}>${totalLiquidity.toFormat(2)}</Text>
                <Box display="flex" flexDirection="row" alignItems="center">
                  <ArrowDropUpRounded className={classes.subtitleIcon} color="primary" />
                  <Text color="primary">3.0%</Text>
                </Box>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard heading="Total ZAP Rewards">
                <Text marginBottom={2} variant="h1" className={classes.statistic} isPlaceholder>482,494</Text>
                <Box alignItems="center" display="flex" className={classes.subtitle}>
                  <Text color="textSecondary">until next epoch</Text>
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
