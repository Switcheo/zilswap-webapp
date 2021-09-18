import { Box, makeStyles } from "@material-ui/core";
import { AppTheme } from "app/theme/types";
import React from "react";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    background: theme.palette.background.gradient,
    padding: theme.spacing(8, 0, 2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0, 2),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(6, 2, 2),
    },
  },
}));

const ARKPage: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {/* Navbar here */}
      {children}
    </Box>
  );
};

export default ARKPage;
