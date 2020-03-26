import { colors } from '@material-ui/core';
import { zilliqa, switcheo } from './colors';

const TEXT_COLORS = {
  primary: zilliqa.neutral[200],
  secondary: zilliqa.neutral[100],
};

export default {
  type: "light",
  toolbar: {
    main: zilliqa.primary["004"],
  },
  primary: {
    contrastText: TEXT_COLORS.primary,
    dark: zilliqa.primary["100"],
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
  },
  switcheoLogo: switcheo.logoLight,
  colors: { zilliqa, switcheo },
};
