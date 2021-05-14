import { Box, Button, makeStyles, Paper } from '@material-ui/core'
import { AppTheme } from 'app/theme/types'
import { PaperProps } from 'material-ui';
import React, { forwardRef } from 'react'
import { NavLink as RouterLink } from "react-router-dom";
import cls from "classnames";

const CustomRouterLink = forwardRef((props: any, ref: any) => (
  <div ref={ref} style={{ flexGrow: 1, flexBasis: 1 }} >
    <RouterLink {...props} />
  </div>
));

const CARD_BORDER_RADIUS = 4;

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(8, 0, 2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0, 2),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(6, 2, 2),
    },
  },
  card: {
    maxWidth: 488,
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
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
  tabNoticeOpposite: {
    "&:after": {
      borderBottom: `8px solid ${theme.palette.background.paperOpposite!}`,
    }
  },
}))

const ILOCard: React.FC<PaperProps> = (props: any) => {
  const { children, className, staticContext, ...rest } = props;
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
            activeClassName={cls(classes.tabActive)}
            component={CustomRouterLink}
            to="/ilo/current">Current ILO</Button>
          <Button
            disableElevation
            color="primary"
            variant="contained"
            className={cls(classes.tab, classes.tabCornerRight)}
            activeClassName={cls(classes.tabActive)}
            component={CustomRouterLink}
            to="/ilo/past">Past ILOs</Button>
        </Box>
        <Box>{children}</Box>
      </Paper>
    </Box>
  )
}

export default ILOCard