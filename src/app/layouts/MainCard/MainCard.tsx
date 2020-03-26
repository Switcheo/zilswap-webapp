import { Box, Button, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import { PaperProps } from "material-ui";
import React, { forwardRef } from "react";
import { NavLink as RouterLink } from "react-router-dom";

const CustomRouterLink = forwardRef((props: any, ref: any) => (
  <div ref={ref} style={{ flexGrow: 1, flexBasis: 1 }} >
    <RouterLink {...props} />
  </div>
));

const CARD_BORDER_RADIUS = 4;

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    paddingTop: theme.spacing(8),
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(6),
    },
    [theme.breakpoints.down("xs")]: {
      paddingTop: theme.spacing(4),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  card: {
    maxWidth: 560,
    margin: "0 auto",
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: CARD_BORDER_RADIUS,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
    },
  },
  tabs: {
    display: "flex",
  },
  tab: {
    position: "relative",
    width: "100%",
    padding: theme.spacing(1.5),
    borderRadius: 0,
    backgroundColor: theme.palette.primary.dark,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    }
  },
  tabCornerLeft: {
    borderTopLeftRadius: CARD_BORDER_RADIUS,
  },
  tabCornerRight: {
    borderTopRightRadius: CARD_BORDER_RADIUS,
  },
  tabActive: {
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
    "&:after": {
      content: "''",
      width: 0,
      height: 0,
      borderLeft: "8px solid transparent",
      borderRight: "8px solid transparent",
      borderBottom: `8px solid ${theme.palette.background.paper}`,
      position: "absolute",
      bottom: 0,
      left: "calc(50% - 8px)",
    }
  },
}));
const MainCard: React.FC<PaperProps> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Paper {...rest} className={classes.card}>
        <Box className={classes.tabs}>
          <Button
            disableElevation
            color="primary"
            variant="contained"
            className={cls(classes.tab, classes.tabCornerLeft)}
            activeClassName={classes.tabActive}
            component={CustomRouterLink}
            to="/swap">Swap</Button>
          <Button
            disableElevation
            color="primary"
            variant="contained"
            className={cls(classes.tab, classes.tabCornerRight)}
            activeClassName={classes.tabActive}
            component={CustomRouterLink}
            to="/pool">Pool</Button>
        </Box>
        <Box>{children}</Box>
      </Paper>
    </Box>
  );
};

export default MainCard;