import { Box, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import SocialLinkGroup from "../SocialLinkGroup";
import NetworkToggle from "../NetworkToggle";
import { ReactComponent as SwitcheoIcon } from "./switcheo.svg";


const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "fixed",
    bottom: 0,
    left: 0,
    minWidth: "100%",
    height: theme.spacing(4.5),
    backgroundColor: theme.palette.toolbar.main,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing(0, 2),
    "& .MuiBox-root": {
      flex: 1,
      flexBasis: 0,
    },
    zIndex: 10
  },
  socialLinks: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  switcheoBrand: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    color: theme.palette.colors.zilliqa.neutral[140],
    "& p": {
      fontSize: 12,
    },
    "& a": {
      borderRadius: 42,
      padding: theme.spacing(1),
    },
    "& path": {
      fill: theme.palette.switcheoLogo,
    },
    [theme.breakpoints.down("xs")]: {
      justifyContent: "flex-start",
    },
  },
}));

const FooterBar: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box {...rest} className={cls(classes.root, className)} elevation={1}>
      <SocialLinkGroup className={classes.socialLinks} />
      <Box className={classes.switcheoBrand}>
        <Typography variant="body1">By</Typography>
        <IconButton href="https://switcheo.network">
          <SwitcheoIcon />
        </IconButton>
      </Box>
      <NetworkToggle />
    </Box>
  );
};

export default FooterBar;
