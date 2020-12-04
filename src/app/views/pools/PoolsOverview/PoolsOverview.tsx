import { Box, Container, Divider, Tab, Tabs } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SearchInput } from "app/components";
import Page from "app/layouts/Page";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { OverviewBanner, PoolsListing } from "./components";

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
  const [searchQuery, setSearchQuery] = useState<string | undefined>();

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

  const onSearch = (query?: string) => {
    setSearchQuery(query);
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
            <SearchInput
              placeholder="Search Pool"
              onSearch={onSearch}
              fullWidth />
          </Box>

          <PoolsListing query={searchQuery} />
        </Container>
      </Box>
      {children}
    </Page>
  );
};

export default PoolsOverview;
