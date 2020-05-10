import MomentUtils from "@date-io/moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/styles";
import { createBrowserHistory } from "history";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { renderRoutes } from "react-router-config";
import { Router } from "react-router-dom";
import { GoogleAnalytics, ScrollReset } from "./components";
import routes from "./routes";
import { RootState } from "./store/types";
import { darkTheme, lightTheme } from "./theme";
import { actions } from "./store";
import { WalletState } from "./store/wallet/types";


const history = createBrowserHistory();
const themes: any = {
  default: lightTheme,
  dark: darkTheme,
  light: lightTheme,
};

const AppContainer: React.FC = () => {

  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  const wallet = useSelector<RootState, WalletState>(state => state.wallet);
  const theme = themes[themeType] || themes.default;
  const dispatch = useDispatch();

  useEffect(() => {
    if (wallet.pk) dispatch(actions.Wallet.init(wallet.pk));
  }, [])

  return (
    <ThemeProvider theme={theme}>
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