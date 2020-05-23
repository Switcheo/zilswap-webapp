import { Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import pathDarkSvg from "./dark.svg";
import pathLightSvg from "./light.svg";
import { ThemeSwitchProps } from "./types";

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

// @ts-ignore
const useStyles = makeStyles(theme => ({
  root: (props: ThemeSwitchProps) => ({
    "& .MuiSwitch-track": {
      position: "relative",
      ...props.forceDark && {
        backgroundColor: "#295154",
      },
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
  }),
}));

const ThemeSwitch: React.FC<ThemeSwitchProps> = (props: ThemeSwitchProps) => {
  const { className, ...rest } = props;
  const classes = useStyles(props);

  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  const dispatch = useDispatch();

  const onToggleTheme = () => {
    const theme = themeType === "light" ? "dark" : "light";
    dispatch(actions.Preference.update({ theme }));
  };

  return (
    <Switch
      color="secondary"
      checked={themeType === THEME_TOGGLE_SELECTED}
      onChange={() => onToggleTheme()}
      {...rest}
      className={cls(classes.root, className)} />
  );
};

export default ThemeSwitch;