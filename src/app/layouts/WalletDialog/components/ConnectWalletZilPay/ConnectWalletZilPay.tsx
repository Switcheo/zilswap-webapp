import React, { useEffect } from "react";
import { Box, Button, DialogContent, InputLabel, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { useDispatch } from "react-redux";
import cls from "classnames";
import { ConnectWalletResult, connectWalletZilPay } from "core/wallet";
import { ContrastBox, FancyButton } from "app/components";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import { ConnectWalletManagerViewProps } from "../../types";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderBottom: theme.palette.border,
    borderRadius: "0 0 12px 12px",
  },
  container: {
    padding: theme.spacing(4.5, 6),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("sm")]: {
      minWidth: 320,
    },
    [theme.breakpoints.up("md")]: {
      minWidth: 470,
    },
  },
  submitButton: {
    minWidth: 240,
    alignSelf: "center",
    height: 46,
    [theme.breakpoints.down("sm")]: {
      minWidth: 200,
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

const ConnectWalletZilPay: React.FC<ConnectWalletManagerViewProps> = (props: any) => {
  const { children, className, onBack: _onBack, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runConnectTask, isCheckingZilPay, errorConnect] = useAsyncTask<void>("connectWalletZilPay");
  const [isLoading] = useTaskSubscriber(...LoadingKeys.connectWallet);

  const onBack = () => {
    if (isLoading) return;
    _onBack(null);
  };

  const connect = () => {
    runConnectTask(async () => {
      if (isLoading) return;

      // Bearby (formerly ZilPay) injects the Zilliqa provider asynchronously —
      // poll briefly before concluding it is missing.
      let zilPay = (window as any).zilPay;
      for (let i = 0; i < 10 && typeof zilPay === "undefined"; ++i) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        zilPay = (window as any).zilPay;
      }
      if (typeof zilPay === "undefined")
        throw new Error(
          "Bearby (ZilPay) is not active on this page. Check that the extension is installed, unlocked, and allowed on this site: right-click the Bearby toolbar icon → 'This can read and change site data' → 'On all sites', then reload this page.");

      if (!zilPay.wallet.isConnect) {
        // The wallet's connect prompt can hang indefinitely if its background
        // service is in a bad state (e.g. RPC_RATE_LIMIT) — time out so the
        // user gets an actionable error and the button stays usable.
        const result = await Promise.race([
          zilPay.wallet.connect(),
          new Promise((_, reject) => setTimeout(() =>
            reject(new Error("The wallet did not respond after 60 seconds. If the wallet shows an RPC error, wait a minute (or switch its node under Bearby's network settings) and try again.")), 60000)),
        ]);
        if (result !== zilPay.wallet.isConnect)
          throw new Error("Connection request was rejected in the wallet.");
      }

      const walletResult: ConnectWalletResult = await connectWalletZilPay(zilPay);
      if (walletResult.error)
        throw walletResult.error;

      if (walletResult.wallet) {
        const { wallet } = walletResult
        const { network } = wallet
        dispatch(actions.Blockchain.initialize({ network, wallet }))
      }
    });
  }

  // auto-click connect
  useEffect(() => {
    connect()
    // eslint-disable-next-line
  }, [])

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            {isCheckingZilPay && (
              <InputLabel>Checking Bearby (ZilPay) Extension</InputLabel>
            )}
            {errorConnect && (
              <Box>
                <InputLabel>
                  <Typography color="error">{errorConnect.message}</Typography>
                </InputLabel>
                <br />
                <Typography color="textPrimary" variant="body2" align="center">
                  New to Bearby (formerly ZilPay)? Download it
                  {" "}
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd">
                    here
                  </Link>!
                </Typography>
              </Box>
            )}
          </Box>
          <FancyButton fullWidth loading={isLoading} onClick={connect} className={classes.submitButton} variant="contained" color="primary">
            Connect
          </FancyButton>
        </ContrastBox>
      </DialogContent>
      <DialogContent className={classes.extraSpacious}>
        <Button className={classes.backButton} onClick={onBack}>
          <ChevronLeftIcon /> Go Back
        </Button>
      </DialogContent>
    </Box>
  );
};

export default ConnectWalletZilPay;
