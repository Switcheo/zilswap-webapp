import { Box, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import TopBar from "app/components/TopBar";
import PropTypes from "prop-types";
import React, { Suspense } from "react";
import { renderRoutes } from "react-router-config";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
  },
  content: {
  },
}));

const MainLayout = props => {
  const { route } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <TopBar />
      <main className={classes.content}>
        <Suspense fallback={<LinearProgress />}>
          {renderRoutes(route.routes)}
        </Suspense>
      </main>
    </Box>
  );
};

MainLayout.propTypes = {
  route: PropTypes.object
};

export default MainLayout;
