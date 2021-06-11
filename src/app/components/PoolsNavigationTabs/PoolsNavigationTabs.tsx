import { Box, Tab, Tabs, TabsProps } from "@material-ui/core";
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
      fontSize: "16px"
    },
    "& .Mui-selected": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected,
      "&:hover": {
        backgroundColor: theme.palette.tab.active,
        color: theme.palette.tab.selected,
      },
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "transparent"
    },
    "& .MuiTab-textColorInherit": {
      // Original: 0.7; Can consider doing this for the tabs on other pages
      opacity: 1
    }
  },
  tabs: {
    width: "40%",
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    },
  },
  tab: {
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    "&:not(:first-child)": {
      borderRadius: "0 12px 12px 0",
      borderWidth: "1px 1px 1px 0",
    },
    "&:not(:last-child)": {
        borderRadius: "12px 0 0 12px"
    },
    backgroundColor: theme.palette.tab.disabledBackground,
    color: theme.palette.tab.disabled,
    "&:hover": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected
    },
    padding: theme.spacing(1.5, 0)
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
      <Box display="flex" justifyContent="center">
        <Tabs onChange={onTabChange} variant="fullWidth" indicatorColor="primary" {...rest} value={tabValue} className={clsx(classes.root, classes.tabs, className)}>
            <Tab className={classes.tab} label="Pools" value="/pools/overview" />
            <Tab className={classes.tab} label="Transactions" value="/pools/transactions" />
          </Tabs>
      </Box>
    </React.Fragment>
  );
};

export default PoolsOverviewBanner;
