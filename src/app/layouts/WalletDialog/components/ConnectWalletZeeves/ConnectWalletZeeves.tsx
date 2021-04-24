import { Box, Button, DialogContent, InputLabel, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox, FancyButton } from "app/components";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import cls from "classnames";
import { ConnectWalletResult, connectWalletZeeves } from "core/wallet";
import { ZilswapConnector } from "core/zilswap";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ConnectWalletManagerViewProps } from "../../types";
import { Network } from "zilswap-sdk/lib/constants";

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

const ConnectWalletZeeves: React.FC<ConnectWalletManagerViewProps> = (props: any) => {
  const { children, className, onResult, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runConnectTask, loadingConnect, errorConnect] = useAsyncTask<void>("connectWalletZeeves");

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
      const zeeves = (window as any).Zeeves;
      if (typeof zeeves === "undefined")
        throw new Error("Zeeves is not supported");

      try {
        await zeeves.auth();
      } catch(err) {
        console.error(err.stack);
        throw new Error("Error connecting Zeeves wallet.");
      }

      const walletResult: ConnectWalletResult = await connectWalletZeeves(zeeves);
      if (walletResult.error)
        throw walletResult.error;

      if (walletResult.wallet) {
        const { wallet } = walletResult
        await ZilswapConnector.connect({
          network: Network.MainNet,
          wallet,
        });
        dispatch(actions.Layout.updateNetwork(Network.MainNet));
        dispatch(actions.Wallet.update({ wallet, zilpay: false }));
      }
    });
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            {loadingConnect && (
              <InputLabel>Connecting Zeeves</InputLabel>
            )}
            {errorConnect && (
              <Box>
                <InputLabel>
                  <Typography color="error">{errorConnect.message}</Typography>
                </InputLabel>
                <br />
                <Typography color="textPrimary" variant="body2" align="center">
                  Don't know about Zeeves? Learn more here -
                  {" "}
                  <Link
                    rel="noopener noreferrer" 
                    target="_blank" 
                    href="https://zeeves.io">
                    here
                  </Link>!
                </Typography>
              </Box>
            )}
          </Box>
          <FancyButton fullWidth loading={loadingConnect} onClick={connect} className={classes.submitButton} variant="contained" color="primary">
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

export default ConnectWalletZeeves;
