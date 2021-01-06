import { Box } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import NetworkToggle from "../NetworkToggle";
import SocialLinkGroup from "../SocialLinkGroup";
import { ReactComponent as SwitcheoLogoDark } from "./SwitcheoTradehubOnDark.svg";
import { ReactComponent as SwitcheoLogoLight } from "./SwitcheoTradehubOnLight.svg";


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
    }
  },
  socialLinks: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  switcheoBrand: {
    display: "flex",
    fontSize: theme.spacing(1.75),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    color: theme.palette.colors.zilliqa.neutral[140],
    paddingTop: 4,
    [theme.breakpoints.down("xs")]: {
      justifyContent: "flex-start",
    },
  },
}));

const FooterBar: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme()

  return (
    <Box {...rest} className={cls(classes.root, className)} elevation={1}>
      <SocialLinkGroup className={classes.socialLinks} />
      <Box className={classes.switcheoBrand}>
        <a href="https://switcheo.network" target="_blank" rel="noopener noreferrer">
          {theme.palette.type === 'light' && <SwitcheoLogoLight />}
          {theme.palette.type === 'dark' && <SwitcheoLogoDark />}
        </a>
      </Box>
      <NetworkToggle />
    </Box>
  );
};

export default FooterBar;
