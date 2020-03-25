import { SimplePaletteColorOptions, ThemeOptions } from "@material-ui/core";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";
import { SpacingOptions } from "@material-ui/core/styles/createSpacing";

export interface AppPalette extends PaletteOptions {
  toolbar: SimplePaletteColorOptions;
}

export interface AppTheme extends ThemeOptions {
  palette: AppPalette;
  spacing: SpacingOptions;
}