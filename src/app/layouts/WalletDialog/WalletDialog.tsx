import React, { Fragment, useEffect, useState } from "react";
import {
  DialogContent,
  InputLabel,
  Typography,
  useTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { DialogModal } from "app/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { WalletState } from "app/store/wallet/types";
import {
  ConnectOptionType,
  WalletConnectType,
} from "../../../core/wallet/ConnectedWallet";
import {
  ConnectWallet,
  ConnectWalletPrivateKey,
  ConnectWalletZilPay,
} from "./components";
import ConnectedWalletBox from "./components/ConnectedWalletBox";
import { ReactComponent as PrivateKeyIconDark } from "./components/ConnectWallet/private-key-dark.svg";
import { ReactComponent as PrivateKeyIcon } from "./components/ConnectWallet/private-key.svg";
import { ReactComponent as ZeevesIcon } from "./components/ConnectWallet/zeeves.svg";
import { ReactComponent as ZilPayIcon } from "./components/ConnectWallet/zilpay.svg";
import { ReactComponent as Z3WalletIcon } from "./components/ConnectWallet/z3wallet.svg";
import { ReactComponent as BoltXIcon } from "./components/ConnectWallet/boltx.svg";
import ConnectWalletBoltX from "./components/ConnectWalletBoltX";
import ConnectWalletZeeves from "./components/ConnectWalletZeeves";
import ConnectWalletZ3Wallet from "./components/ConnectWalletZ3Wallet";

const DIALOG_HEADERS: { [key in ConnectOptionType]: string } = {
  z3wallet: "Connect With Z3Wallet",
  zeeves: "Connect With Zeeves",
  zilpay: "Connect With ZilPay",
  boltX: "Connect With BoltX",
  privateKey: "Connect With Private Key",
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
}));

const WalletDialog: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const [connectWalletType, setConnectWalletType] =
    useState<ConnectOptionType | null>("privateKey");
  const [error, setError] = useState<string | null>();
  const walletState = useSelector<RootState, WalletState>(
    (state) => state.wallet
  );
  const showWalletDialog = useSelector<RootState, boolean>(
    (state) => state.layout.showWalletDialog
  );

  const getIcon = () => {
    switch (walletState.wallet?.type) {
      case WalletConnectType.Z3Wallet:
        return Z3WalletIcon;
      case WalletConnectType.ZilPay:
        return ZilPayIcon;
      case WalletConnectType.BoltX:
        return BoltXIcon;
      case WalletConnectType.Zeeves:
        return ZeevesIcon;
      case WalletConnectType.PrivateKey:
      default:
        return theme.palette.type === "dark"
          ? PrivateKeyIconDark
          : PrivateKeyIcon;
    }
  };

  useEffect(() => {
    if (showWalletDialog && connectWalletType) setConnectWalletType(null);

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
      return "Your Wallet";
    } else if (connectWalletType === null) {
      return "Connect Wallet";
    } else {
      return DIALOG_HEADERS[connectWalletType];
    }
  };
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
      {walletState.wallet ? (
        <ConnectedWalletBox onBack={onBack} icon={getIcon()} />
      ) : (
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
          {connectWalletType === "boltX" && (
            <ConnectWalletBoltX onBack={onBack} />
          )}
          {connectWalletType === "zeeves" && (
            <ConnectWalletZeeves onBack={onBack} />
          )}
          {connectWalletType === "z3wallet" && (
            <ConnectWalletZ3Wallet onBack={onBack} />
          )}
        </Fragment>
      )}
    </DialogModal>
  );
};

export default WalletDialog;
