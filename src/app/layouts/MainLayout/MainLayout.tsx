import React, { Suspense, useState, useMemo } from "react";
import { Box, Hidden, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { renderRoutes } from "react-router-config";
import { useLocation } from "react-router-dom";
import { ConnectWalletButton, NavDrawer, TopBar, DrawerComp, AdvertBanner } from "app/components";
import { AppTheme } from "app/theme/types";
import TransactionDialog from "../TransactionDialog";
import WalletDialog from "../WalletDialog";
import { DevInfoBadge } from "./components";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: theme.palette.background.gradient,
  },
  content: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(8),
    },
  },
}));

const MainLayout: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { route } = props;
  const classes = useStyles();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showTabDrawer, setShowTabDrawer] = useState(false);
  const location = useLocation();

  const currentPath: "swap" | "pool" | "bridge" | "zilo" | "ark" | "main" = useMemo(() => {
    const current = location.pathname;

    if (current.indexOf("/swap") === 0 || (current.indexOf("/pool") === 0 && current.indexOf("/pools") !== 0)) return "swap";
    else if (current.indexOf("/pools") === 0)
      return "pool";
    else if (
      current.indexOf("/bridge") === 0 ||
      current.indexOf("/history") === 0
    )
      return "bridge";
    else if (current.indexOf("/zilo") === 0) return "zilo";
    else if (current.indexOf("/arky") === 0) return "ark";
    else return "main";
  }, [location.pathname]);

  const onToggleDrawer = (override?: boolean) => {
    setShowDrawer(typeof override === "boolean" ? override : !showDrawer);
  };

  const onToggleTabDrawer = (override?: boolean) => {
    setShowTabDrawer(typeof override === "boolean" ? override : !showTabDrawer);
  };

  return (
    <Box className={classes.root}>
      <TopBar currentPath={currentPath} onToggleDrawer={onToggleDrawer} onToggleTabDrawer={onToggleTabDrawer} />
      <NavDrawer open={showDrawer} onClose={() => onToggleDrawer(false)} />
      <main className={classes.content}>
        <DevInfoBadge />
        <Suspense fallback={<LinearProgress />}>
          {currentPath !== "bridge" &&
            <AdvertBanner />
          }
          {renderRoutes(route.routes)}
        </Suspense>
      </main>
      <Hidden smUp>
        <ConnectWalletButton />
      </Hidden>
      <WalletDialog />
      <TransactionDialog />
      <DrawerComp onClose={() => setShowTabDrawer(false)} open={showTabDrawer} navPath={currentPath} />
    </Box>
  );
};

export default MainLayout;
