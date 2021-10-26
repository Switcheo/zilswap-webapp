import React, { Fragment, useMemo } from "react";
import {
  AppBar,
  Box,
  Button,
  Hidden,
  IconButton,
  Toolbar,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { Link, useLocation } from "react-router-dom";
import { Brand } from "app/components/TopBar/components";
import RewardsInfoButton from "app/layouts/RewardsInfoButton";
import { AppTheme } from "app/theme/types";
import ConnectWalletButton from "../ConnectWalletButton";
import { ReactComponent as MenuIcon } from "./menu.svg";
import { TopBarProps } from "./types";
import { ReactComponent as SwapLogo } from "./assets/swap.svg";
import { ReactComponent as PoolLogo } from "./assets/pool.svg";
import { ReactComponent as ZilBridgeLogo } from "./assets/zilbridge.svg";
import { ReactComponent as ZiloLogo } from "./assets/zilo.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: "100%",
  },
  toolBar: {
    justifyContent: "space-between",
    padding: 0,
    borderBottom: "1px solid transparent",
    borderImage:
      theme.palette.type === "dark"
        ? "linear-gradient(to left, #003340 1%, #00FFB0  50%, #003340 100%) 0 0 100% 0/0 0 1px 0 stretch"
        : "",
    [theme.breakpoints.up("sm")]: {
      "&>div": {
        flex: 1,
        flexBasis: 1,
        display: "flex",
        flexDirection: "row",
      },
    },
    [theme.breakpoints.down("xs")]: {
      paddingRight: 0,
    },
  },
  themeSwitch: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  grow: {
    flexGrow: 1,
  },
  chipText: {
    color: theme.palette.text.primary,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 2),
    justifyContent: "flex-start",
  },
  brandButton: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  brandBox: {
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(16),
    },
    "& svg": {
      height: 24,
    },
  },
}));

const TopBar: React.FC<TopBarProps & React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, onToggleDrawer, ...rest } = props;
  const classes = useStyles();
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const location = useLocation();

  const renderLogo = useMemo(() => {
    const current = location.pathname;

    if (current.indexOf("/swap") === 0) return <SwapLogo />;
    else if (current.indexOf("/pool") === 0 || current.indexOf("/pools") === 0)
      return <PoolLogo />;
    else if (
      current.indexOf("/bridge") === 0 ||
      current.indexOf("/history") === 0
    )
      return <ZilBridgeLogo />;
    else if (current.indexOf("/zilo") === 0) return <ZiloLogo />;
    else return <Brand />;
  }, [location.pathname]);

  return (
    <AppBar
      {...rest}
      elevation={0}
      position="static"
      className={cls(classes.root, className)}
    >
      <Toolbar className={classes.toolBar} variant="dense">
        {isXs ? (
          <Fragment>
            <Box flex={1}>
              <div className={classes.drawerHeader}>
                <IconButton onClick={onToggleDrawer}>
                  <MenuIcon />
                </IconButton>
              </div>
            </Box>
            <Box display="flex" justifyContent="center">
              <Button
                component={Link}
                to="/"
                className={classes.brandButton}
                disableRipple
              >
                <Brand />
              </Button>
            </Box>
          </Fragment>
        ) : (
          <Box className={classes.brandBox}>{renderLogo}</Box>
        )}
        <Box
          display="flex"
          justifyContent="flex-end"
          flex={1}
          alignItems="center"
        >
          <RewardsInfoButton />
          <Hidden xsDown>
            <ConnectWalletButton />
          </Hidden>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
