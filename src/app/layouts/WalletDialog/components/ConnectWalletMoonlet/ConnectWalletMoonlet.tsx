import { Box, Button, DialogContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox } from "app/components";
import { useMessageSubscriber } from "app/utils";
import cls from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectWalletManagerViewProps } from "../../types";
import { ConnectOptionType, ConnectedWallet, ConnectWalletResult } from "core/wallet/ConnectedWallet";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { dapp } from "dapp-wallet-util";
import WalletService from "core/wallet";

const useStyles = makeStyles(theme => ({
  root: {
  },
  container: {
    padding: theme.spacing(4.5, 6),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  extraSpacious: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    }
  },
  backButton: {
    alignSelf: "center",
  },
}));

const ConnectWalletMoonlet: React.FC<ConnectWalletManagerViewProps & React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, onResult, ...rest } = props;
  const [moonletBridgeReady, setMoonletBridgeReady] = useState(false);
  const classes = useStyles();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dispatch = useDispatch();
  const subscriber = useMessageSubscriber();

  useEffect(() => {
    const unsubscriber = subscriber(onMessage);
    return () => unsubscriber();
    // eslint-disable-next-line
  }, []);

  // const showDialog = useSelector<RootState, boolean>(state => state.layout.showWalletDialog);

  const onMessage = async (data: any) => {
    if (data.type && data.type === "walletReady") {
      setMoonletBridgeReady(true);

      if(iframeRef.current) {
        iframeRef.current!.contentWindow!
        .postMessage({ type: "grantPermissionRequest", walletId: "moonlet" }, "https://cryptolandtech.github.io/dapp-wallet-util/");
      }
    }
    console.log("on mesgg",data,iframeRef.current);
  };

  // const onToggleDialog = (override?: OpenCloseState) => {
  //   dispatch(actions.Layout.toggleShowWallet(override));
  // };

  const onSelect = async (type: ConnectOptionType, args?: any) => {

    const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
    console.log(zilliqa);
  };

  const onConnect = async () => {
    if(WalletService) {
      await WalletService.connectWalletMoonlet();
    }
  }

  const onBack = async () => {
    if (typeof onResult === "function")
      onResult(null);
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container} onClick={onConnect}>
          <Typography variant="h2">Connect Moonlet</Typography>
        </ContrastBox>
      </DialogContent>
      <DialogContent className={classes.extraSpacious}>
        <Button className={classes.backButton} onClick={onBack}>
          <ChevronLeftIcon /> Go Back
        </Button>
      </DialogContent>
      <iframe ref={iframeRef} height={0} width={0} frameBorder={0} src="https://cryptolandtech.github.io/dapp-wallet-util/" />
    </Box>
  );
};

export default ConnectWalletMoonlet;