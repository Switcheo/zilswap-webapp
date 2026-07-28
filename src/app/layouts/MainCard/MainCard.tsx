import React, { Fragment } from "react";
import { Box, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { PaperProps } from "material-ui";
import { AppTheme } from "app/theme/types";


// const CustomRouterLink = forwardRef((props: any, ref: any) => (
//   <div ref={ref} style={{ flexGrow: 1, flexBasis: 1 }}>
//     <RouterLink {...props} />
//   </div>
// ));

interface Props extends PaperProps{
  header?: React.ReactNode
  wrapperClass?: string
  paperClass?: string
}

const CARD_BORDER_RADIUS = 12;

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(8, 0, 2),
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 0, 2),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(6, 2, 2),
    },
  },
  graph: {
    [theme.breakpoints.down("sm")]: {
      height: 400,
    },
    [theme.breakpoints.down("xs")]: {},
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(6, 0, 2),
      flexDirection: "row",
      width: "100%",
    },
  },
  card: {
    maxWidth: 488,
    margin: "0 auto",
    background:
      theme.palette.type === "dark"
        ? "linear-gradient(#13222C, #002A34)"
        : "#F6FFFC",
    border:
      theme.palette.border,
    boxShadow: theme.palette.mainBoxShadow,
    borderRadius: CARD_BORDER_RADIUS,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
    },
  },
  tabs: {
    display: "flex",
    width: "488px",
    marginBottom: "2em",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 450,
    },
  },
  tab: {
    position: "relative",
    width: "100%",
    borderRadius: 0,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    backgroundColor: theme.palette.tab.disabledBackground,
    color: theme.palette.tab.disabled,
    "&:hover": {
      backgroundColor: theme.palette.tab.active,
      color: theme.palette.tab.selected,
    },
    "&.Mui-disabled": {
      backgroundColor: theme.palette.tab.disabledBackground,
    },
  },
  tabLeft: {
    borderTopLeftRadius: CARD_BORDER_RADIUS,
    borderBottomLeftRadius: CARD_BORDER_RADIUS,
    border:
      theme.palette.border,
  },
  tabNoBorder: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    border:
      theme.palette.border,
    borderWidth: "1px 1px 1px 0",
  },
  tabRight: {
    borderTopRightRadius: CARD_BORDER_RADIUS,
    borderBottomRightRadius: CARD_BORDER_RADIUS,
    border:
      theme.palette.border,
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
    },
  },
}));
const MainCard: React.FC<Props> = (props: any) => {
  const { children, className, staticContext, header, wrapperClass, paperClass, ...rest } = props;
  const classes = useStyles();

  // NOTE: the price graph was removed 2026-07 — it depended on ZilStream's
  // rates API, which is permanently offline, so it only ever flashed a
  // loading state. The swap card is centered on its own instead.

  return (
    <Fragment>
      <Box className={classes.root}>
        {/* <Box display="flex" justifyContent="center">
          <Box className={classes.tabs}>
            <Button
              disableElevation
              onClick={closeAdvancedSetting}
              color="primary"
              variant="contained"
              className={cls(classes.tab, classes.tabLeft)}
              activeClassName={cls(classes.tabActive, {
                [classes.tabNoticeOpposite]: hasNotification,
              })}
              component={CustomRouterLink}
              to="/swap"
            >
              Swap
            </Button>
            <Button
              disableElevation
              onClick={closeAdvancedSetting}
              color="primary"
              variant="contained"
              className={cls(classes.tab, classes.tabRight)}
              activeClassName={cls(classes.tabActive, {
                [classes.tabNoticeOpposite]: hasNotification,
              })}
              component={CustomRouterLink}
              to="/pool"
            >
              Pool
            </Button>
          </Box>
        </Box> */}
        <Box display="flex" justifyContent="center">
          <Box className={wrapperClass} width={488}>
            {header && header}
            <Paper {...rest} className={cls(classes.card, paperClass)}>
              <Box>{children}</Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
};

export default MainCard;
