import { createMuiTheme } from '@material-ui/core';

import { light, dark } from './palettes';
import typography from './typography';
import overrides from './overrides';

const darkFlavouringTheme = createMuiTheme({ palette: dark });
const lightFlavouringTheme = createMuiTheme({ palette: light });

const flavour = (overrides, theme) => {
  const result = {};
  for (const key in overrides)
    result[key] = overrides[key](theme);
  return result;
}

export const lightTheme = createMuiTheme({
  typography: flavour(typography, lightFlavouringTheme),
  overrides: flavour(overrides, lightFlavouringTheme),
  palette: light,
});

export const darkTheme = createMuiTheme({
  typography: flavour(typography, darkFlavouringTheme),
  overrides: flavour(overrides, darkFlavouringTheme),
  palette: dark,
});
