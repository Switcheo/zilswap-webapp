import React from "react";
import {
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
} from "@material-ui/core";
import DarkIcon from "@material-ui/icons/Brightness2Rounded";
import LightIcon from "@material-ui/icons/Brightness4Rounded";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import { ThemeSwitchProps } from "./types";

const THEME_TOGGLE_SELECTED = "light";

interface ToggleSwitchProps extends ThemeSwitchProps {
  compact?: boolean;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: (props: ThemeSwitchProps) => ({
    "& .MuiSwitch-track": {
      position: "relative",
      ...(props.forceDark && {
        backgroundColor: `rgba${hexToRGBA("#00FFB0", 0.5)}`,
      }),
    },
    "& .Mui-checked+.MuiSwitch-track": {
      backgroundColor: `rgba${hexToRGBA("#003340", 0.5)}`,
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: theme.palette.type === "dark" ? "#00FFB0" : "#003340",
      width: 14,
      height: 14,
    },
    "& .MuiSwitch-switchBase": {
      padding: "6px",
      top: "6px",
      left: "6px",
    },
  }),
  label: {
    marginLeft: theme.spacing(1),
    marginRight: 0,
    color:
      theme.palette.type === "dark"
        ? `rgba${hexToRGBA("#DEFFFF", 0.5)}`
        : `rgba${hexToRGBA("#003340", 0.5)}`,
  },
  icon: {
    fontSize: "1.4rem",
    verticalAlign: "middle",
  },
  compactIcon: {
    paddingBottom: "18px",
  },
}));

const ThemeSwitch: React.FC<ToggleSwitchProps> = (props: ToggleSwitchProps) => {
  const { className, forceDark, compact, ...rest } = props;
  const classes = useStyles(props);

  const themeType = useSelector<RootState, string>(
    (state) => state.preference.theme
  );
  const dispatch = useDispatch();

  const onToggleTheme = () => {
    const theme = themeType === "light" ? "dark" : "light";
    dispatch(actions.Preference.update({ theme }));
  };

  return compact ? (
    <IconButton onClick={() => onToggleTheme()} className={classes.compactIcon}>
      {themeType === "dark" ? (
        <DarkIcon className={clsx(classes.label, className)} />
      ) : (
        <LightIcon className={clsx(classes.label, className)} />
      )}
    </IconButton>
  ) : (
    <FormGroup row>
      <FormControlLabel
        control={
          <Switch
            color="secondary"
            checked={themeType === THEME_TOGGLE_SELECTED}
            onChange={() => onToggleTheme()}
            {...rest}
            className={clsx(classes.root, className)}
          />
        }
        label={
          themeType === "dark" ? (
            <LightIcon className={classes.icon} />
          ) : (
            <DarkIcon className={classes.icon} />
          )
        }
        labelPlacement="start"
        className={classes.label}
      />
    </FormGroup>
  );
};

export default ThemeSwitch;
