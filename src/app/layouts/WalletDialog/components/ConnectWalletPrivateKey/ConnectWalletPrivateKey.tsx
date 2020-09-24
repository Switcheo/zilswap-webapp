import { Box, Button, DialogContent, InputLabel, OutlinedInput, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox, FancyButton } from "app/components";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { useAsyncTask } from "app/utils";
import cls from "classnames";
import { connectWalletPrivateKey } from "core/wallet";
import { ConnectWalletResult } from "core/wallet/ConnectedWallet";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ConnectWalletManagerViewProps } from "../../types";
import { ZilswapConnector } from "core/zilswap";

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
  addressInput: {
    "& input": {
      padding: "17.5px 14px",
      fontSize: "14px",
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

const ConnectWalletPrivateKey: React.FC<ConnectWalletManagerViewProps> = (props: any) => {
  const { children, className, onResult, ...rest } = props;
  const classes = useStyles();
  const [privateKey, setPrivateKey] = useState("");
  const dispatch = useDispatch();
  const [runConnectTask, loadingConnect, errorConnect] = useAsyncTask<void>("connectWalletPrivateKey");

  const onBack = () => {
    if (typeof onResult === "function")
      onResult(null);
  };

  const onTextChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(ev.target.value);
  }

  const connect = () => {
    if (loadingConnect) return;

    runConnectTask(async () => {
      const walletResult: ConnectWalletResult = await connectWalletPrivateKey(privateKey);
      if (walletResult.error)
        throw walletResult.error;

      if (walletResult.wallet) {
        const { network } = walletResult.wallet!;
        await ZilswapConnector.connect({
          network,
          wallet: walletResult.wallet,
        });
        console.log("connector connected");
        dispatch(actions.Wallet.update({ wallet: walletResult.wallet!, privateKey }));
      }
    });
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <form className={classes.form} noValidate autoComplete="off">
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <InputLabel>Enter a Private Key</InputLabel>
              {errorConnect && (
                <InputLabel><Typography color="error">{errorConnect.message}</Typography></InputLabel>
              )}
            </Box>
            <OutlinedInput className={classes.addressInput} value={privateKey} onChange={onTextChange} />
            {/* <InputLabel>Enter a Password</InputLabel>
            <OutlinedInput type="password" value={password} onChange={onPasswordChange} /> */}
            <FancyButton fullWidth loading={loadingConnect} onClick={connect} className={classes.submitButton} variant="contained" color="primary">
              Connect
            </FancyButton>
          </form>
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

export default ConnectWalletPrivateKey;
