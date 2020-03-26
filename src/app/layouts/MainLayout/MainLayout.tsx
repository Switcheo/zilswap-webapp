import { Box, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { FooterBar, NavDrawer, TopBar } from "app/components";
import React, { Suspense, useState } from "react";
import { renderRoutes } from "react-router-config";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
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
        <Suspense fallback={<LinearProgress />}>
          {renderRoutes(route.routes)}
        </Suspense>
      </main>
      <FooterBar />
      <NavDrawer open={showDrawer} onClose={() => onToggleDrawer(false)} />
    </Box>
  );
};

export default MainLayout;
