import { colors } from '@material-ui/core';

const TEXT_COLORS = {
  primary: "#1A1A1A",
  secondary: "#FFFFFF",
};

export default {
  type: "light",
  toolbar: {
    main: "#F2F8F8",
  },
  primary: {
    contrastText: TEXT_COLORS.primary,
    dark: "#149BA3",
    main: "#149BA3",
    light: "#00C7D3",
  },
  error: {
    contrastText: TEXT_COLORS.secondary,
    dark: colors.red[900],
    main: "#CF3F1F",
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
  background: {},
};
