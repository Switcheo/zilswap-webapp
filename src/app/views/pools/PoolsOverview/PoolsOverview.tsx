import { Box, Container, Divider, Grid, Tab, Tabs, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Page from "app/layouts/Page";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { OverviewBanner, PoolInfoCard } from "./components";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

const PoolsOverview: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const isPools = useRouteMatch("/pools");

  const {
    tabValue,
  } = React.useMemo(() => {
    if (!isPools) return {};

    const tabValue = location.pathname;

    return {
      tabValue,
    };
  }, [isPools, location.pathname]);

  const onTabChange = (event: React.ChangeEvent<{}>, newValue: any) => {
    history.push(newValue);
  };

  if (!isPools) return null;

  return (
    <Page {...rest} className={cls(classes.root, className)}>
      <OverviewBanner />
      <Box marginTop={6.5}>
        <Container maxWidth="lg">
          <Tabs value={tabValue} onChange={onTabChange} indicatorColor="primary">
            <Tab label="Pools" value="/pools/overview" />
            <Tab label="Transactions" value="/pools/transactions" />
          </Tabs>
          <Divider />

          <Box marginTop={4} marginBottom={2}>
            <TextField 
              variant="outlined" 
              placeholder="Search Pool"
              fullWidth />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <PoolInfoCard />
            </Grid>
            <Grid item xs={12} md={6}>
              <PoolInfoCard />
            </Grid>
            <Grid item xs={12} md={6}>
              <PoolInfoCard />
            </Grid>
            <Grid item xs={12} md={6}>
              <PoolInfoCard />
            </Grid>
          </Grid>
        </Container>
      </Box>
      {children}
    </Page>
  );
};

export default PoolsOverview;
