
import { colors } from '@material-ui/core';
import { zilliqa, switcheo } from "./colors";

const TEXT_COLORS = {
  primary: "#DEFFFF",
  secondary: "rgba(222, 255, 255, 0.5)",
};

const theme = {
  type: "dark",
  toolbar: {
    main: "#0D1B24",
  },
  primary: {
    contrastText: "#DEFFFF",
    dark: "#00FFB0",
    main: "#003340",
    light: "rgba(222, 255, 255, 0.5)",
  },
  error: {
    contrastText: TEXT_COLORS.secondary,
    dark: colors.red[900],
    main: zilliqa.danger,
    light: colors.red[400]
  },
  success: {
    contrastText: TEXT_COLORS.secondary,
    dark: colors.green[900],
    main: colors.green[600],
    light: colors.green[400]
  },
  text: {
    primary: TEXT_COLORS.primary,
    secondary: TEXT_COLORS.secondary,
    disabled: "rgba(222, 255, 255, 0.5)",
  },
  button: {
    primary: "#00FFB0",
  },
  background: {
    default: "#0D1B24",
    gradient: "radial-gradient(50% 50% at 50% 0%, #00FFB0 -800%, rgba(0, 255, 176, 0) 85%), radial-gradient(50% 50% at 50% 100%, #00FFB0 -800%, rgba(0, 255, 176, 0) 85%), #0D1B24",
    contrast: "rgba(222, 255, 255, 0.1)",
    contrastAlternate: "#262626",
    paper: zilliqa.black,
    paperOpposite: zilliqa.neutral[100],
    tooltip: "#13222C",
    readOnly: zilliqa.neutral["195"]
  },
  action: {
    active: "#13222C",
    disabled: "rgba(222, 255, 255, 0.5)",
    disabledBackground: "#003340",
    selected: "#00FFB0"
  },
  tab: {
    active: "#13222C",
    disabled: "rgba(222, 255, 255, 0.5)",
    disabledBackground: "#0D1B24",
    selected: "#DEFFFF"
  },
  mainBoxShadow: "none",
  cardBoxShadow: "0 4px 8px 1px rgba(0, 0, 0, 0.2)",
  navbar: "#0D1B24",
  switcheoLogo: switcheo.logoDark,
  colors: { zilliqa, switcheo },
  currencyInput: "rgba(222, 255, 255, 0.1)",
  icon: "#00FFB0",
  label: "rgba(222, 255, 255, 0.5)",
  warning: {
    main: "#FFDF6B"
  },
  link: "#00FFB0",
};

export default theme;
