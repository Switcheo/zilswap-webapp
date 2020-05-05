import { makeStyles } from "@material-ui/core/styles";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import cls from "classnames";
import { ConnectOptionType, ConnectedWallet } from "../../../core/wallet/ConnectedWallet";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectWallet, ConnectWalletMoonlet, ConnectWalletPrivateKey } from "./components";

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
  const dispatch = useDispatch();

  useEffect(() => {
    if (showWalletDialog && connectWalletType)
      setConnectWalletType(null);

    // eslint-disable-next-line
  }, [showWalletDialog]);

  const onCloseDialog = () => {
    dispatch(actions.Layout.toggleShowWallet("close"));
  };

  const onSelectConnectOption = (connectType: ConnectOptionType) => {
    setConnectWalletType(connectType);
  };

  const onConnectWalletResult = (wallet: ConnectedWallet | null) => {
    if (!wallet)
      setConnectWalletType(null);
  };

  const dialogHeader = connectWalletType === null ? "Connect Wallet" : DIALOG_HEADERS[connectWalletType];

  return (
    <DialogModal header={dialogHeader} open={showWalletDialog} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      {connectWalletType === null && (
        <ConnectWallet onSelectConnectOption={onSelectConnectOption} />
      )}
      {connectWalletType === "moonlet" && (
        <ConnectWalletMoonlet onResult={onConnectWalletResult} />
      )}
      {connectWalletType === "privateKey" && (
        <ConnectWalletPrivateKey onResult={onConnectWalletResult} />
      )}
    </DialogModal>
  );
};

export default WalletDialog;