import { makeStyles } from "@material-ui/core/styles";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import cls from "classnames";
import { useMessageSubscriber } from "app/utils";
import { ConnectOptionType, ConnectedWallet, ConnectWalletResult } from "../../../core/wallet/ConnectedWallet";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectWallet, ConnectWalletMoonlet, ConnectWalletPrivateKey } from "./components";
import { getZilliqa } from "core/zilliqa";
import WalletService from "core/wallet";

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
  const [connectedWallet, setConnectedWallet] = useState<ConnectWalletResult>({})
  const dispatch = useDispatch();
  const zilliqa = getZilliqa();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const subscriber = useMessageSubscriber();

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
        const wallet = await WalletService.connectWalletMoonlet();
        console.log({ wallet })
        setConnectedWallet(wallet);
      }
    }
  };

  const onConnectWalletResult = (wallet: ConnectedWallet | null) => {
    if (!wallet)
      setConnectWalletType(null);
  };

  const dialogHeader = connectWalletType === null ? "Connect Wallet" : DIALOG_HEADERS[connectWalletType];

  return (
    <DialogModal header={dialogHeader} open={showWalletDialog} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      {zilliqa === undefined && (
        <ConnectWallet onSelectConnectOption={onSelectConnectOption} />
      )}
      {connectWalletType === "moonlet" && zilliqa && (
        <ConnectWalletMoonlet onResult={onConnectWalletResult} />
      )}
      {connectWalletType === "privateKey" && zilliqa && (
        <ConnectWalletPrivateKey onResult={onConnectWalletResult} />
      )}
      {connectWalletType === "moonlet" && (
        <iframe ref={iframeRef} height={0} width={0} frameBorder={0} src="https://cryptolandtech.github.io/dapp-wallet-util/" />
      )}
    </DialogModal>
  );
};

export default WalletDialog;