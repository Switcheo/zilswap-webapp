import { SimplePaletteColorOptions, ThemeOptions } from "@material-ui/core";
import { Breakpoints } from "@material-ui/core/styles/createBreakpoints";
import { PaletteOptions, TypeBackground, TypeAction } from "@material-ui/core/styles/createPalette";
import { Spacing } from "@material-ui/core/styles/createSpacing";

export type AppTypeBackground = {
  gradient: string;
  contrast: string;
  tooltip: string;
  paperOpposite: string;
  readOnly: string;
  contrastAlternate: string;
}

export interface AppColors {
  zilliqa: any;
  switcheo: any;
}
export interface AppPalette extends PaletteOptions {
  primary: SimplePaletteColorOptions;
  secondary: SimplePaletteColorOptions;
  error: SimplePaletteColorOptions;
  success: SimplePaletteColorOptions;
  background: AppTypeBackground & TypeBackground;
  tab: TypeAction;
  toolbar: SimplePaletteColorOptions;
  colors: AppColors;
  switcheoLogo: string;
  navbar: string;
  mainBoxShadow: string;
  cardBoxShadow: string;
  currencyInput: string;
  icon: string;
  label: string;
  warning: SimplePaletteColorOptions;
  link: string;
}

export interface AppTheme extends ThemeOptions {
  palette: AppPalette;
  breakpoints: Breakpoints;
  spacing: Spacing;
}
