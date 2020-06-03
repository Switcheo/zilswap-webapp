import MomentUtils from "@date-io/moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/styles";
import { AppButler, ViewBlock } from "core/utilities";
import { connectWalletPrivateKey, ConnectWalletResult } from "core/wallet";
import { ZilswapConnector } from "core/zilswap";
import { createBrowserHistory } from "history";
import React, { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { renderRoutes } from "react-router-config";
import { Router } from "react-router-dom";
import { GoogleAnalytics, ScrollReset } from "./components";
import routes from "./routes";
import { actions } from "./store";
import { RootState, Transaction } from "./store/types";
import { WalletState } from "./store/wallet/types";
import { darkTheme, lightTheme } from "./theme";
import { useAsyncTask } from "./utils";


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
  const store = useStore();
  const walletState = useSelector<RootState, WalletState>(store => store.wallet);
  const [runConnectTask] = useAsyncTask<void>("connectWalletPrivateKey");

  useEffect(() => {
    if (walletState.pk && !walletState.wallet) {
      const privateKey = walletState.pk!;
      runConnectTask(async () => {
        const walletResult: ConnectWalletResult = await connectWalletPrivateKey(privateKey);

        if (walletResult.wallet) {
          const { wallet } = walletResult;
          const { network } = wallet;
          const storeState: RootState = store.getState();

          await ZilswapConnector.connect({
            wallet, network,
            observedTxs: storeState.transaction.observingTxs,
          });

          dispatch(actions.Wallet.update({ wallet, pk: privateKey, }));

          const viewblockTxs = await ViewBlock.listTransactions({
            network: network.toLowerCase(),
            address: wallet.addressInfo.bech32,
          });
          const transactions: Transaction[] = viewblockTxs.map((tx: any) => ({
            hash: tx.hash.replace(/^0x/, ""),
            status: "confirmed",
          }))
          console.log({ transactions });

          dispatch(actions.Transaction.init({ transactions }))

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