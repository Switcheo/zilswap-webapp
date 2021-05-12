import { Box, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { FooterBar, NavDrawer, TopBar } from "app/components";
import { AppTheme } from "app/theme/types";
import React, { Suspense, useState } from "react";
import { renderRoutes } from "react-router-config";
import WalletDialog from "../WalletDialog";
import { DevInfoBadge } from "./components";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "row",
    paddingBottom: theme.spacing(8),
    [theme.breakpoints.down("sm")]: {
      display: "block",
    }
  },
}));

const MainLayout: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { route } = props;
  const classes = useStyles();
  const [showDrawer, setShowDrawer] = useState(false);

  const onToggleDrawer = (override?: boolean) => {
    setShowDrawer(typeof override === "boolean" ? override : !showDrawer);
  };

  return (
    <Box className={classes.root}>
      <TopBar onToggleDrawer={onToggleDrawer} />
      <main className={classes.content}>
        <DevInfoBadge />
        <Suspense fallback={<LinearProgress />}>
          {renderRoutes(route.routes)}
        </Suspense>
      </main>
      <FooterBar />
      <WalletDialog />
      <NavDrawer open={showDrawer} onClose={() => onToggleDrawer(false)} />
    </Box>
  );
};

export default MainLayout;
