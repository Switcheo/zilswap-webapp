import { colors } from '@material-ui/core';
import { zilliqa, switcheo } from './colors';

const TEXT_COLORS = {
  primary: zilliqa.neutral[200],
  secondary: zilliqa.neutral[140],
};

const themev1 = {
  type: "light",
  toolbar: {
    main: zilliqa.primary["004"],
  },
  primary: {
    contrastText: zilliqa.neutral[100],
    dark: zilliqa.primary["130"],
    main: zilliqa.primary["100"],
    light: zilliqa.primary["020"],
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
  },
  background: {
    default: zilliqa.neutral[100],
    contrast: zilliqa.primary["002"],
    contrastAlternate: zilliqa.primary["010"],
    paper: zilliqa.neutral[100],
    paperOpposite: zilliqa.neutral[190],
    tooltip: zilliqa.primary["195"],
    readOnly: zilliqa.primary["004"]
  },
  mainBoxShadow: "0 8px 16px 0 rgba(20,155,163,0.16)",
  cardBoxShadow: "0 4px 8px 2px rgba(20, 155, 163, 0.16)",
  navbar: zilliqa.neutral[200],
  switcheoLogo: switcheo.logoLight,
  colors: { zilliqa, switcheo },
};

export default themev1;