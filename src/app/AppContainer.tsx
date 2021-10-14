import React, { useEffect } from "react";
import DayJsUtils from "@date-io/dayjs";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { StylesProvider, ThemeProvider, jssPreset } from "@material-ui/styles";
import { create } from "jss";
import jssCompose from "jss-plugin-compose";
import jssExtend from "jss-plugin-extend";
import { createBrowserHistory } from "history";
import { useSelector } from "react-redux";
import { renderRoutes } from "react-router-config";
import { Router } from "react-router-dom";
import { AppButler, isDebug } from "core/utilities";
import { SnackbarUtilsConfigurator } from "app/utils/useToaster";
import { GoogleAnalytics, NotificationBar, ScrollReset } from "./components";
import routes from "./routes";
import { startSagas } from "./saga";
import { RootState } from "./store/types";
import { darkTheme, lightTheme } from "./theme";

import "zeeves-auth-sdk-js";

if ((window as any).Zeeves) {
  (window as any).Zeeves.properties.isDebug = isDebug();
}

const history = createBrowserHistory();
const themes: any = {
  default: darkTheme,
  dark: darkTheme,
  light: lightTheme,
};
const jss = create({
  plugins: [jssExtend(), jssCompose(), ...jssPreset().plugins],
});

const AppContainer: React.FC = () => {

  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  const theme = themes[themeType] || themes.default;

  useEffect(() => {
    startSagas();
  }, []);

  return (
    <StylesProvider jss={jss}>
      <ThemeProvider theme={theme}>
        <NotificationBar>
          <SnackbarUtilsConfigurator />
          <AppButler />
          <CssBaseline />
          <MuiPickersUtilsProvider utils={DayJsUtils}>
            <Router history={history}>
              <ScrollReset />
              <GoogleAnalytics />
              {renderRoutes(routes)}
            </Router>
          </MuiPickersUtilsProvider>
        </NotificationBar>
      </ThemeProvider>
    </StylesProvider>
  );
};

export default AppContainer;
