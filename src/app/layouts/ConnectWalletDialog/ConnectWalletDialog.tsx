import { Backdrop, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { actions } from "app/store";
import { OpenCloseState } from "app/store/layout/types";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectWalletOption } from "./components";

import { ReactComponent as MoonletIcon } from "./moonlet.svg";
import { ReactComponent as PrivateKeyIcon } from "./private-key.svg";
import { RootState } from "app/store/types";
import WalletService from "core/wallet";
import { ConnectWalletResult } from "core/wallet/wallet";
import { Zilliqa } from "@zilliqa-js/zilliqa";

type ConnectOptionType = "moonlet" | "privateKey";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content",
    borderRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  extraSpacious: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    }
  },
}));

window.addEventListener('message', (e) => {
  console.log(e.data);
});
const ConnectWalletModal: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  const showDialog = useSelector<RootState, boolean>(state => state.layout.showConnectWallet);

  const onToggleDialog = (override?: OpenCloseState) => {
    dispatch(actions.Layout.toggleConnectWallet(override));
  };

  const connectWallet = async (type: ConnectOptionType, args?: any): Promise<ConnectWalletResult> => {
    switch (type) {
      case "moonlet": return await WalletService.connectWalletMoonlet();
      case "privateKey":
        if (!args || !args.privateKey)
          throw new Error("invalid private key");
        return await WalletService.connectWalletPrivateKey(args.privateKey);
    }
  };

  const onSelect = async (type: ConnectOptionType, args?: any) => {
    console.log("onSelect");

    const iframe = document.createElement('iframe');
    iframe.width = "0";
    iframe.height = "0";
    iframe.frameBorder = "0";
    iframe.id = 'wallet-bridge-iframe-' + Math.random().toString().substr(2);
    iframe.src = 'https://cryptolandtech.github.io/dapp-wallet-util/';
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow!
        .postMessage({ type: "grantPermissionRequest", walletId: "moonlet" }, 'https://cryptolandtech.github.io/dapp-wallet-util/');
    }

    // const wallet = await connectWallet(type, args);
    // const zilliqa = new Zilliqa('https://api.zilliqa.com');
    // console.log(zilliqa);

    // console.log("connect wallet result", wallet);
  };

  return (
    <Dialog
      maxWidth={"md"}
      open={showDialog}
      onClose={() => onToggleDialog("close")}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      {...rest}
      className={cls(classes.root, className)} >
      <DialogTitle disableTypography>
        <Typography variant="h2">Connect Wallet</Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={() => onToggleDialog("close")}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ConnectWalletOption label="Moonlet Wallet" icon={MoonletIcon} secureLevel={4} buttonText="Connect Moonlet" onSelect={() => onSelect("moonlet")} />
        <ConnectWalletOption label="Private Key" icon={PrivateKeyIcon} secureLevel={1} buttonText="Enter Private Key" onSelect={() => onSelect("privateKey")} />
      </DialogContent>
      <DialogContent className={classes.extraSpacious}>
        <Typography color="textPrimary" variant="body2" align="center">
          New to Moonlet? Download <Link href="#">here</Link> or <Link href="#">contact us</Link>.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;