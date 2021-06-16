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

const CARD_BORDER_RADIUS = 12;

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
    background: theme.palette.type === "dark" ? "linear-gradient(#13222C, #002A34)" : "#F6FFFC",
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
    },
  },
  tabs: {
    display: "flex",
    width: "488px",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
    },
  },
  tab: {
    position: "relative",
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: theme.palette.tab.disabledBackground,
    color: theme.palette.tab.disabled,
    "&:hover": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected
    }
  },
  tabCornerLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
  },
  tabCornerRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderWidth: "1px 1px 1px 0",
  },
  tabActive: {
    backgroundColor: theme.palette.tab.active,
    color: theme.palette.tab.selected,
    "&:hover": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected,
    },
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
      <Box display="flex" justifyContent="center" marginBottom="2em">
        <Box className={classes.tabs}>
          <Button
            disableElevation
            color="primary"
            variant="contained"
            className={cls(classes.tab, classes.tabCornerLeft)}
            activeClassName={cls(classes.tabActive)}
            component={CustomRouterLink}
            to="/zilo/current">Current</Button>
          <Button
            disableElevation
            color="primary"
            variant="contained"
            className={cls(classes.tab, classes.tabCornerRight)}
            activeClassName={cls(classes.tabActive)}
            component={CustomRouterLink}
            to="/zilo/past">Past</Button>
        </Box>
      </Box>
      <Paper {...rest} className={classes.card}>
        <Box>{children}</Box>
      </Paper>
    </Box>
  )
}

export default ILOCard;
