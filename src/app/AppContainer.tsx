import MomentUtils from "@date-io/moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/styles";
import { AppButler } from "core/utilities";
import { createBrowserHistory } from "history";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { renderRoutes } from "react-router-config";
import { Router } from "react-router-dom";
import { GoogleAnalytics, ScrollReset, Zeeves } from "./components";
import routes from "./routes";
import { startSagas } from "./saga";
import { RootState } from "./store/types";
import { darkTheme, lightTheme } from "./theme";

const history = createBrowserHistory();
const themes: any = {
  default: lightTheme,
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
      <Zeeves />
      <AppButler />
      <CssBaseline />
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Router history={history}>
          <ScrollReset />
          <GoogleAnalytics />
          {renderRoutes(routes)}
        </Router>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default AppContainer;
