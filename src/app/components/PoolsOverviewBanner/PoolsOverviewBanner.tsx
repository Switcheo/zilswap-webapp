import { Box, BoxProps, Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowDropUpRounded } from "@material-ui/icons";
import { StatsCard, Text } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";

interface Props extends BoxProps {}

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

const PoolsOverviewBanner: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Box className={classes.banner}>
        <Container maxWidth="lg">
          <Text marginBottom={4} variant="h1">Overview</Text>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StatsCard heading="Total Value Locked">
                <Text marginBottom={2} variant="h1" className={classes.statistic} isPlaceholder>$8,691,498</Text>
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
                    <Text marginBottom={2} variant="h1" className={classes.statistic} isPlaceholder>05</Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text color="textSecondary">days</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic} isPlaceholder>20</Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text color="textSecondary">hours</Text>
                    </Box>
                  </Box>
                  <Text variant="h1" className={classes.statistic} marginX={1}>:</Text>
                  <Box display="flex" flexDirection="column">
                    <Text marginBottom={2} variant="h1" className={classes.statistic} isPlaceholder>20</Text>
                    <Box alignItems="center" display="flex" className={classes.subtitle}>
                      <Text color="textSecondary">minutes</Text>
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
