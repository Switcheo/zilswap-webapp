import { SimplePaletteColorOptions, ThemeOptions } from "@material-ui/core";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";
import { SpacingOptions } from "@material-ui/core/styles/createSpacing";
import { Breakpoints } from "@material-ui/core/styles/createBreakpoints";

export interface AppColors {
  zilliqa: any,
  switcheo: any,
}
export interface AppPalette extends PaletteOptions {
  toolbar: SimplePaletteColorOptions;
  colors: AppColors;
  switcheoLogo: string,
  navbar: string,
}

export interface AppTheme extends ThemeOptions {
  palette: AppPalette;
  breakpoints: Breakpoints,
  spacing: ((factorX: number, factorY?: number) => string | number);
}