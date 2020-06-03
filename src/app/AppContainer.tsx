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
import { WalletState } from "./store/wallet/types";
import { connectWalletPrivateKey, ConnectWalletResult } from "core/wallet";
import { useAsyncTask } from "./utils";
import { actions } from "./store";
import { AppButler } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";


const history = createBrowserHistory();
const themes: any = {
  default: lightTheme,
  dark: darkTheme,
  light: lightTheme,
};

const AppContainer: React.FC = () => {

  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  const theme = themes[themeType] || themes.default;
  const dispatch = useDispatch();
  const walletState = useSelector<RootState, WalletState>(store => store.wallet);
  const [runConnectTask] = useAsyncTask<void>("connectWalletPrivateKey");

  useEffect(() => {
    if (walletState.pk && !walletState.wallet) {
      const privateKey = walletState.pk!;
      runConnectTask(async () => {
        const walletResult: ConnectWalletResult = await connectWalletPrivateKey(privateKey);

        if (walletResult.wallet) {
          const savedTxsString = localStorage.getItem("zilswap:observing-txs") || "[]";
          const savedObservingTxs = JSON.parse(savedTxsString);
          console.log({ savedObservingTxs });

          await ZilswapConnector.connect({
            wallet: walletResult.wallet!,
            network: walletResult.wallet!.network,
            observedTxs: savedObservingTxs,
          });

          dispatch(actions.Wallet.update({ wallet: walletResult.wallet!, pk: privateKey, }));
        } else {
          dispatch(actions.Wallet.update({ wallet: undefined, pk: undefined }));
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <ThemeProvider theme={theme}>
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