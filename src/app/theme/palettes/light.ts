import { colors } from '@material-ui/core';
import { zilliqa, switcheo } from './colors';

const TEXT_COLORS = {
  primary: "#003340",
  secondary: "rgba(0, 51, 64, 0.5)",
};

const theme = {
  type: "light",
  toolbar: {
    main: "#003340",
  },
  primary: {
    contrastText: "#DEFFFF",
    dark: "#003340",
    main: "#003340",
    light: "rgba(0, 51, 64, 0.5)",
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
    primary: "#02586D",
  },
  background: {
    default: "#F6FFFC",
    contrast: "#D4FFF2",
    contrastAlternate: "#F6FFFC",
    paper: zilliqa.neutral[100],
    paperOpposite: zilliqa.neutral[190],
    tooltip: "#F6FFFC",
    readOnly: zilliqa.primary["004"]
  },
  action: {
    active: "#003340",
    disabled: "rgba(222, 255, 255, 0.5)",
    disabledBackground: "rgba(0, 51, 64, 0.5)",
    selected: "#003340"
  },
  tab: {
    active: "#003340",
    disabled: "rgba(222, 255, 255, 0.5)",
    disabledBackground: "#7B999E",
    selected: "#DEFFFF"
  },
  mainBoxShadow: "0 8px 16px 0 rgba(20,155,163,0.16)",
  cardBoxShadow: "0 4px 8px 2px rgba(20, 155, 163, 0.16)",
  navbar: "#DEFFF5",
  switcheoLogo: switcheo.logoLight,
  colors: { zilliqa, switcheo },
  currencyInput: "#D4FFF2",
  icon: "#003340",
  label: "#003340",
  warning: {
    main: "#FF5252"
  },
  link: "#02586D",
};

export default theme;
