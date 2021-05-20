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
    contrastText: "#003340",
    dark: zilliqa.primary["130"],
    main: zilliqa.primary["100"],
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
    disabled: "rgba(222, 255, 255, 1)",
  },
  button: {
    primary: "#14707C",
  },
  background: {
    default: "#F6FFFC",
    contrast: zilliqa.primary["002"],
    contrastAlternate: zilliqa.primary["010"],
    paper: zilliqa.neutral[100],
    paperOpposite: zilliqa.neutral[190],
    tooltip: zilliqa.primary["195"],
    readOnly: zilliqa.primary["004"]
  },
  action: {
    active: "#F6FFFC",
    disabled: "#003340",
  },
  mainBoxShadow: "0 8px 16px 0 rgba(20,155,163,0.16)",
  cardBoxShadow: "0 4px 8px 2px rgba(20, 155, 163, 0.16)",
  navbar: "#DEFFF5",
  switcheoLogo: switcheo.logoLight,
  colors: { zilliqa, switcheo },
};

export default theme;
