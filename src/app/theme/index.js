import { createMuiTheme } from "@material-ui/core";

import { light, dark } from "./palettes";
import typography from "./typography";
import overrides from "./overrides";

const darkFlavouringTheme = createMuiTheme({ palette: dark });
const lightFlavouringTheme = createMuiTheme({ palette: light });

const flavour = (overrides, theme) => {
  const result = {};
  for (const key in overrides)
    result[key] = overrides[key](theme);
  return result;
}

export const lightTheme = createMuiTheme({
  overrides: flavour(overrides, lightFlavouringTheme),
  typography: typography,
  palette: light,
});

export const darkTheme = createMuiTheme({
  overrides: flavour(overrides, darkFlavouringTheme),
  typography: typography,
  palette: dark,
});