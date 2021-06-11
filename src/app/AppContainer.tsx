import DayJsUtils from "@date-io/dayjs";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/styles";
import { AppButler, isDebug } from "core/utilities";
import { createBrowserHistory } from "history";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { renderRoutes } from "react-router-config";
import { Router } from "react-router-dom";
import { GoogleAnalytics, ScrollReset, NotificationBar } from "./components";
import routes from "./routes";
import { startSagas } from "./saga";
import { RootState } from "./store/types";
import { darkTheme, lightTheme } from "./theme";
import { SnackbarUtilsConfigurator } from "app/utils/useToaster";

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

const AppContainer: React.FC = () => {

  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  const theme = themes[themeType] || themes.default;

  useEffect(() => {
    startSagas();
  }, []);

  return (
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
  );
};

export default AppContainer;
