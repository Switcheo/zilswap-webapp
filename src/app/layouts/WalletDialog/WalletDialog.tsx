import { DialogContent, InputLabel, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import cls from "classnames";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectedWallet, ConnectOptionType, WalletConnectType } from "../../../core/wallet/ConnectedWallet";
import { ConnectWallet, ConnectWalletPrivateKey, ConnectWalletZilPay } from "./components";
import ConnectedWalletBox from "./components/ConnectedWalletBox";
import { ReactComponent as PrivateKeyIconDark } from "./components/ConnectWallet/private-key-dark.svg";
import { ReactComponent as PrivateKeyIcon } from "./components/ConnectWallet/private-key.svg";
import { ReactComponent as ZilPayIcon } from "./components/ConnectWallet/zilpay.svg";

const DIALOG_HEADERS: { [key in ConnectOptionType]: string } = {
  zilpay: "Connect With ZilPay",
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
  const theme = useTheme();
  const [error, setError] = useState<string | null>();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  const get_icon = () => {
    if (walletState.wallet?.type === WalletConnectType.ZilPay) return ZilPayIcon;
    return theme.palette.type === "dark" ? PrivateKeyIconDark : PrivateKeyIcon;
  }


  useEffect(() => {
    if (showWalletDialog && connectWalletType)
      setConnectWalletType(null);

    // eslint-disable-next-line
  }, [showWalletDialog]);

  const onCloseDialog = () => {
    dispatch(actions.Layout.toggleShowWallet("close"));
  };

  const onSelectConnectOption = async (connectType: ConnectOptionType) => {
    setConnectWalletType(connectType);
    setError(null);
  };
  const onConnectWalletResult = (wallet: ConnectedWallet | null) => {
    if (!wallet)
      setConnectWalletType(null);
  };

  const getDialogHeader = () => {
    if (walletState.wallet) {
      return "Connected Wallet"
    } else if (connectWalletType === null) {
      return "Connect Wallet"
    } else {
      return DIALOG_HEADERS[connectWalletType]
    }
  }
  return (
    <DialogModal
      header={getDialogHeader()}
      open={showWalletDialog}
      onClose={onCloseDialog}
      {...rest}
      className={cls(classes.root, className)}>
      {error && (
        <DialogContent>
          <InputLabel>
            <Typography color="error">{error}</Typography>
          </InputLabel>
        </DialogContent>
      )}
      {!walletState.wallet && (
        <Fragment>
          {!connectWalletType && (
            <ConnectWallet onSelectConnectOption={onSelectConnectOption} />
          )}
          {connectWalletType === "privateKey" && (
            <ConnectWalletPrivateKey onResult={onConnectWalletResult} />
          )}
          {connectWalletType === "zilpay" && (
            <ConnectWalletZilPay onResult={onConnectWalletResult} />
          )}
        </Fragment>
      )}
      {walletState.wallet && (
        <ConnectedWalletBox onLogout={() => { setConnectWalletType(null) }} icon={get_icon()} />
      )}
    </DialogModal>
  );
};

export default WalletDialog;
