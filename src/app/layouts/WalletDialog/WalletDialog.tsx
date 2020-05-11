import { makeStyles } from "@material-ui/core/styles";
import { DialogModal, ContrastBox } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import cls from "classnames";
import { useMessageSubscriber } from "app/utils";
import { ConnectOptionType, ConnectedWallet, ConnectWalletResult, WalletConnectType } from "../../../core/wallet/ConnectedWallet";
import React, { useEffect, useState, useRef, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectWallet, ConnectWalletMoonlet, ConnectWalletPrivateKey } from "./components";
import { getZilliqa } from "core/zilliqa";
import WalletService from "core/wallet";
import { WalletState } from "app/store/wallet/types";
import { DialogContent } from "@material-ui/core";
import { ReactComponent as MoonletIcon } from "./components/ConnectWallet/moonlet.svg";
import { ReactComponent as PrivateKeyIcon } from "./components/ConnectWallet/private-key.svg";
import ConnectedWalletBox from "./components/ConnectedWalletBox";

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
  const [moonletBridgeReady, setMoonletBridgeReady] = useState(false);
  const dispatch = useDispatch();
  const zilliqa = getZilliqa();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const subscriber = useMessageSubscriber();
  const wallet = useSelector<RootState, WalletState>(state => state.wallet);

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
    if (connectType === "moonlet") {
      if (WalletService) {
        //@ts-ignore
        const { wallet } = await WalletService.connectWalletMoonlet();
        dispatch(actions.Wallet.update({ wallet, currencies: {} }));
        dispatch(actions.Layout.toggleShowWallet());
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
      {!wallet.wallet && (
        <Fragment>
          {zilliqa === undefined && !connectWalletType && (
            <ConnectWallet onSelectConnectOption={onSelectConnectOption} />
          )}
          {connectWalletType === "moonlet" && zilliqa && (
            <ConnectWalletMoonlet onResult={onConnectWalletResult} />
          )}
          {connectWalletType === "privateKey" && (
            <ConnectWalletPrivateKey onResult={onConnectWalletResult} />
          )}
          {connectWalletType === "moonlet" && (
            <iframe ref={iframeRef} height={0} width={0} frameBorder={0} src="https://cryptolandtech.github.io/dapp-wallet-util/" />
          )}
        </Fragment>
      )}
      {wallet.wallet && (
        <Fragment>
          <DialogContent>
            <ConnectedWalletBox icon={PrivateKeyIcon} />
          </DialogContent>
        </Fragment>
      )}
    </DialogModal>
  );
};

export default WalletDialog;