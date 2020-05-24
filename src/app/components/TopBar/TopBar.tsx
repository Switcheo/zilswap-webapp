import { AppBar, Box, IconButton, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Brand } from "app/components/TopBar/components";
import cls from "classnames";
import React from "react";
import ThemeSwitch from "../ThemeSwitch";
import ConnectWalletButton from "../ConnectWalletButton";
import { ReactComponent as MenuIcon } from "./menu.svg";
import { TopBarProps } from "./types";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: "100%",
  },
  toolBar: {
    paddingLeft: 0,
    [theme.breakpoints.up("sm")]: {
      "&>div": {
        flex: 1,
        flexBasis: 1,
        display: "flex",
        flexDirection: "row",
      },
    },
    [theme.breakpoints.down("xs")]: {
      paddingRight: 0,
    },
  },
  themeSwitch: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  grow: {
    flexGrow: 1,
  },
  chipText: {
    color: theme.palette.text.primary
  }
}));

const TopBar: React.FC<TopBarProps & React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, onToggleDrawer, ...rest } = props;
  const classes = useStyles();

  return (
    <AppBar {...rest} elevation={0} position="static" className={cls(classes.root, className)}>
      <Toolbar className={classes.toolBar} variant="dense">
        <Box justifyContent="flex-start">
          <IconButton onClick={onToggleDrawer}>
            <MenuIcon />
          </IconButton>
        </Box>
        <Box justifyContent="center">
          <Brand />
        </Box>
        <Box display="flex" flex={1} justifyContent="flex-end" alignItems="center">
          <ConnectWalletButton />
          <ThemeSwitch className={classes.themeSwitch} />
        </Box>
      </Toolbar>
    </AppBar >
  );
};

export default TopBar;