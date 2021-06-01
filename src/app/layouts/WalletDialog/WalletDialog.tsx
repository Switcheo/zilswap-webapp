import { DialogContent, InputLabel, Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import cls from "classnames";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectOptionType, WalletConnectType } from "../../../core/wallet/ConnectedWallet";
import { ConnectWallet, ConnectWalletPrivateKey, ConnectWalletZilPay } from "./components";
import ConnectedWalletBox from "./components/ConnectedWalletBox";
import { ReactComponent as PrivateKeyIconDark } from "./components/ConnectWallet/private-key-dark.svg";
import { ReactComponent as PrivateKeyIcon } from "./components/ConnectWallet/private-key.svg";
import { ReactComponent as ZeevesIcon } from "./components/ConnectWallet/zeeves.svg";
import { ReactComponent as ZilPayIcon } from "./components/ConnectWallet/zilpay.svg";
import ConnectWalletZeeves from "./components/ConnectWalletZeeves";

const DIALOG_HEADERS: { [key in ConnectOptionType]: string } = {
  zeeves: "Connect With Zeeves",
  zilpay: "Connect With ZilPay",
  privateKey: "Connect With Private Key",
};

const useStyles = makeStyles(theme => ({
  root: {
  },
}));

const WalletDialog: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const [connectWalletType, setConnectWalletType] = useState<ConnectOptionType | null>("privateKey");
  const [error, setError] = useState<string | null>();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const showWalletDialog = useSelector<RootState, boolean>(state => state.layout.showWalletDialog);

  const getIcon = () => {
    switch (walletState.wallet?.type) {
      case WalletConnectType.ZilPay:
        return ZilPayIcon;
      case WalletConnectType.Zeeves:
        return ZeevesIcon;
      case WalletConnectType.PrivateKey:
      default:
        return theme.palette.type === "dark" ? PrivateKeyIconDark : PrivateKeyIcon;
    }
  }


  useEffect(() => {
    if (showWalletDialog && connectWalletType)
      setConnectWalletType(null);

    // eslint-disable-next-line
  }, [showWalletDialog]);

  const onCloseDialog = () => {
    dispatch(actions.Layout.toggleShowWallet("close"));
  };

  const onSelect = async (connectType: ConnectOptionType) => {
    setConnectWalletType(connectType);
    setError(null);
  };

  const onBack = () => {
    setConnectWalletType(null);
  };

  const getDialogHeader = () => {
    if (walletState.wallet) {
      return "Your Wallet"
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
      className={cls(classes.root, className)}
    >
      {error && (
        <DialogContent>
          <InputLabel>
            <Typography color="error">{error}</Typography>
          </InputLabel>
        </DialogContent>
      )}
      {
        walletState.wallet ?
          <ConnectedWalletBox onBack={onBack} icon={getIcon()} />
          :
          <Fragment>
            {!connectWalletType && (
              <ConnectWallet onSelectConnectOption={onSelect} />
            )}
            {connectWalletType === "privateKey" && (
              <ConnectWalletPrivateKey onBack={onBack} />
            )}
            {connectWalletType === "zilpay" && (
              <ConnectWalletZilPay onBack={onBack} />
            )}
            {connectWalletType === "zeeves" && (
              <ConnectWalletZeeves onBack={onBack} />
            )}
          </Fragment>
      }
    </DialogModal>
  );
};

export default WalletDialog;
