import { Divider, Tab, Tabs, TabsProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TypographyOptions } from "@material-ui/core/styles/createTypography";
import { AppTheme } from "app/theme/types";
import clsx from "clsx";
import React from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router";

interface Props extends Omit<TabsProps, "value"> { }

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    "& .MuiTab-wrapper": {
      ...(theme.typography as TypographyOptions).h1,
    },
  },
  divider: {
    backgroundColor: "rgba(20, 155, 163, 0.3)",
  },
}));

const PoolsOverviewBanner: React.FC<Props> = (props: Props) => {
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
    <React.Fragment>
      <Tabs onChange={onTabChange} indicatorColor="primary" {...rest} value={tabValue} className={clsx(classes.root, className)}>
        <Tab label="Pools" value="/pools/overview" />
        <Tab label="Transactions" value="/pools/transactions" />
      </Tabs>
      <Divider className={classes.divider} />
    </React.Fragment>
  );
};

export default PoolsOverviewBanner;
