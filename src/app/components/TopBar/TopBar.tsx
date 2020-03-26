import { Box, AppBar, Switch, Toolbar, Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { Brand } from "app/components/TopBar/components";
import { ReactComponent as MenuIcon } from "./menu.svg"

import pathLightSvg from "./light.svg";
import pathDarkSvg from "./dark.svg";

const THEME_TOGGLE_SELECTED = "dark";
const BASE_STYLE_TOGGLE_ICON = {
  content: '""',
  height: 12,
  width: 12,
  display: "block",
  position: "absolute",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  top: 3,
};

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
  btnConnect: {

  },
  switchTheme: {
    "& .MuiSwitch-track": {
      position: "relative",
    },
    "& .MuiSwitch-track::after": {
      ...BASE_STYLE_TOGGLE_ICON,
      right: 5,
      backgroundImage: `url(${pathDarkSvg})`,
    },
    "& .Mui-checked+.MuiSwitch-track::after": {
      ...BASE_STYLE_TOGGLE_ICON,
      left: 5,
      backgroundImage: `url(${pathLightSvg})`,
    },
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  grow: {
    flexGrow: 1,
  }
}));

const TopBar: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  const dispatch = useDispatch();

  const onToggleTheme = () => {
    const theme = themeType === "light" ? "dark" : "light";
    dispatch(actions.Preference.update({ theme }));
  };

  return (
    <AppBar {...rest} elevation={0} position="static" className={cls(classes.root, className)}>
      <Toolbar className={classes.toolBar} variant="dense">
        <Box justifyContent="flex-start">
          <IconButton>
            <MenuIcon />
          </IconButton>
        </Box>
        <Box justifyContent="center">
          <Brand theme={themeType} />
        </Box>
        <Box display="flex" flex={1} justifyContent="flex-end">
          <Button className={classes.btnConnect}>Connect Wallet</Button>
          <Switch className={classes.switchTheme} color="secondary" checked={themeType === THEME_TOGGLE_SELECTED} onChange={() => onToggleTheme()} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;