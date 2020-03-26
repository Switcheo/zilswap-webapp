import { Box, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import TopBar from "app/components/TopBar";
import PropTypes from "prop-types";
import React, { Suspense } from "react";
import { renderRoutes } from "react-router-config";
import FooterBar from "app/components/FooterBar";

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

const MainLayout = props => {
  const { route } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <TopBar />
      <main className={classes.content}>
        {/* <div style={{height:4000}}/> */}
        <Suspense fallback={<LinearProgress />}>
          {renderRoutes(route.routes)}
        </Suspense>
      </main>
      <FooterBar />
    </Box>
  );
};

MainLayout.propTypes = {
  route: PropTypes.object
};

export default MainLayout;
