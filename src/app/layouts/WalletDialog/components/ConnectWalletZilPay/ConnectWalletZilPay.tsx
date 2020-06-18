import { Box, Button, DialogContent, InputLabel, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox, FancyButton } from "app/components";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import cls from "classnames";
import { ConnectWalletResult, connectWalletZilPay } from "core/wallet";
import { ZilswapConnector } from "core/zilswap";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ConnectWalletManagerViewProps } from "../../types";
const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
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
    marginTop: theme.spacing(6),
    minWidth: 240,
    alignSelf: "center",
    height: 46
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
  const { children, className, onResult, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runConnectTask, loadingConnect, errorConnect] = useAsyncTask<void>("connectWalletZilPay");

  useEffect(() => {
    connect();
    // eslint-disable-next-line
  }, []);

  const onBack = () => {
    if (typeof onResult === "function")
      onResult(null);
  };

  const connect = () => {
    if (loadingConnect) return;

    runConnectTask(async () => {
      const zilPay = (window as any).zilPay;
      if (typeof zilPay === "undefined")
        throw new Error("ZilPay extension not installed");

      const result = await zilPay.wallet.connect();
      if (result !== zilPay.wallet.isConnect)
        throw new Error("ZilPay could not connect.");

      const walletResult: ConnectWalletResult = await connectWalletZilPay(zilPay);
      if (walletResult.error)
        throw walletResult.error;

      if (walletResult.wallet) {
        const { network } = walletResult.wallet!;
        await ZilswapConnector.connect({
          network,
          wallet: walletResult.wallet,
        });
        dispatch(actions.Wallet.update({ wallet: walletResult.wallet!, zilpay: true }));
      }
    });
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            {loadingConnect && (
              <InputLabel>Checking ZilPay Extension</InputLabel>
            )}
            {errorConnect && (
              <Box>
                <InputLabel>
                  <Typography color="error">{errorConnect.message}</Typography>
                </InputLabel>
                <br />
                <Typography color="textPrimary" variant="body2" align="center">
                  New to ZilPay? Download <Link target="_blank" href="https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd">here</Link> or <Link href="#">contact us</Link>.
                </Typography>
              </Box>
            )}
          </Box>
          <FancyButton loading={loadingConnect} onClick={connect} className={classes.submitButton} variant="contained" color="primary">
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