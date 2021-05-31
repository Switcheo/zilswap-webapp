
import { colors } from '@material-ui/core';
import { zilliqa, switcheo } from "./colors";

const TEXT_COLORS = {
  primary: zilliqa.neutral[100],
  secondary: zilliqa.neutral[140],
};
const themev1 = {
  type: "dark",
  toolbar: {
    main: zilliqa.neutral[190],
  },
  primary: {
    contrastText: zilliqa.neutral[100],
    dark: zilliqa.primary["130"],
    main: zilliqa.primary["100"],
    light: zilliqa.neutral["200"],
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
    default: zilliqa.neutral[200],
    contrast: zilliqa.neutral[190],
    paper: zilliqa.black,
    paperOpposite: zilliqa.neutral[100],
    tooltip: zilliqa.primary["195"],
    readOnly: zilliqa.neutral["195"]
  },
  mainBoxShadow: "none",
  cardBoxShadow: "0 4px 8px 1px rgba(0, 0, 0, 0.2)",
  navbar: zilliqa.neutral[200],
  switcheoLogo: switcheo.logoDark,
  colors: { zilliqa, switcheo },
};

export default themev1;