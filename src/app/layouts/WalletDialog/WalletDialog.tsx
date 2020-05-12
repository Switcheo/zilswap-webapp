import { DialogContent, useTheme, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import { useMessageSubscriber } from "app/utils";
import cls from "classnames";
import WalletService from "core/wallet";
import { getZilliqa } from "core/zilliqa";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectedWallet, ConnectOptionType } from "../../../core/wallet/ConnectedWallet";
import { ConnectWallet, ConnectWalletPrivateKey } from "./components";
import ConnectedWalletBox from "./components/ConnectedWalletBox";
import { ReactComponent as MoonletIcon } from "./components/ConnectWallet/moonlet.svg";
import { ReactComponent as PrivateKeyIconDark } from "./components/ConnectWallet/private-key-dark.svg";
import { useErrorCatcher } from "app/utils";
import { ReactComponent as PrivateKeyIcon } from "./components/ConnectWallet/private-key.svg";

const DIALOG_HEADERS: { [key in ConnectOptionType]: string } = {
  moonlet: "Connect Moonlet Wallet",
  privateKey: "Connect With Private Key",
};

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const WalletDialog: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  const [connectWalletType, setConnectWalletType] = useState<ConnectOptionType | null>("privateKey");
  const showWalletDialog = useSelector<RootState, boolean>(state => state.layout.showWalletDialog);
  const [moonletBridgeReady, setMoonletBridgeReady] = useState(false); // eslint-disable-line
  const dispatch = useDispatch();
  const zilliqa = getZilliqa();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useTheme();
  const [error, setError] = useState<string | null>();
  const subscriber = useMessageSubscriber();
  const wallet = useSelector<RootState, WalletState>(state => state.wallet);
  const errorCatcher = useErrorCatcher((err: any) => {
    if (err) {
      if (err === "WALLET_SCRIPT_INJECT_TIMEOUT" || err === "WALLET_NOT_INSTALLED")
        setError("Error occurred, please ensure that the moonlet extension is installed/enabled");
      else if (err === "USER_DID_NOT_GRANT_PERMISSION")
        setError("User denied permission");
      else setError(err);
      setConnectWalletType(null);
    }
  });

  const get_icon = () => {
    if (wallet.wallet.type !== 1) return MoonletIcon;
    return theme.palette.type === "dark" ? PrivateKeyIconDark : PrivateKeyIcon;
  }

  useEffect(() => {
    const unsubscriber = subscriber(onMessage);
    return () => unsubscriber();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (showWalletDialog && connectWalletType)
      setConnectWalletType(null);

    // eslint-disable-next-line
  }, [showWalletDialog]);

  const onMessage = async (data: any) => {
    if (data.type && data.type === "walletReady") {
      setMoonletBridgeReady(true);

      if (iframeRef.current) {
        iframeRef.current!.contentWindow!
          .postMessage({ type: "grantPermissionRequest", walletId: "moonlet" }, "https://cryptolandtech.github.io/dapp-wallet-util/");
      }
    }
  };

  const onCloseDialog = () => {
    dispatch(actions.Layout.toggleShowWallet("close"));
  };

  const onSelectConnectOption = async (connectType: ConnectOptionType) => {
    setConnectWalletType(connectType);
    setError(null);
    if (connectType === "moonlet") {
      if (WalletService) {
        errorCatcher(async () => {
          //@ts-ignore
          const { wallet } = await WalletService.connectWalletMoonlet();
          dispatch(actions.Wallet.update({ wallet, currencies: {} }));
        }, "connectWallet")
      }
    }
  };

  const onConnectWalletResult = (wallet: ConnectedWallet | null) => {
    if (!wallet)
      setConnectWalletType(null);
  };

  const getDialogHeader = () => {
    if (wallet.wallet) {
      return "Connected Wallet"
    } else if (connectWalletType === null) {
      return "Connect Wallet"
    } else {
      return DIALOG_HEADERS[connectWalletType]
    }
  }
  return (
    <DialogModal header={getDialogHeader()} open={showWalletDialog} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        {error && (
          <InputLabel><Typography color="error">{error}</Typography></InputLabel>
        )}
      </DialogContent>
      {!wallet.wallet && (
        <Fragment>
          {zilliqa === undefined && !(connectWalletType === "privateKey") && (
            <ConnectWallet loading={connectWalletType === "moonlet"} onSelectConnectOption={onSelectConnectOption} />
          )}
          {connectWalletType === "privateKey" && (
            <ConnectWalletPrivateKey onResult={onConnectWalletResult} />
          )}
          {connectWalletType === "moonlet" && (
            <iframe title="moonlet" ref={iframeRef} height={0} width={0} frameBorder={0} src="https://cryptolandtech.github.io/dapp-wallet-util/" />
          )}
        </Fragment>
      )}
      {wallet.wallet && (
        <Fragment>
          <DialogContent>
            <ConnectedWalletBox onLogout={() => { setConnectWalletType(null) }} icon={get_icon()} />
          </DialogContent>
        </Fragment>
      )}
    </DialogModal>
  );
};

export default WalletDialog;