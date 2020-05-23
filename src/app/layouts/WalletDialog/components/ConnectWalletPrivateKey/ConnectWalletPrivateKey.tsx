import { Box, Button, CircularProgress, DialogContent, InputLabel, OutlinedInput, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox } from "app/components";
import { actions } from "app/store";
import { WalletActionTypes } from "app/store/wallet/actions";
import { AppTheme } from "app/theme/types";
import { useErrorCatcher } from "app/utils";
import cls from "classnames";
import { connectWalletPrivateKey } from "core/wallet";
import { ConnectWalletResult } from "core/wallet/ConnectedWallet";
import React, { useEffect, useState } from "react";
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

let mounted = false

const ConnectWalletPrivateKey: React.FC<ConnectWalletManagerViewProps & React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, onResult, ...rest } = props;
  const classes = useStyles();
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const errorCatcher = useErrorCatcher((err: any) => err && setError(err.message));

  const onBack = () => {
    if (typeof onResult === "function")
      onResult(null);
  };

  const onTextChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(ev.target.value);
  }

  useEffect(() => {
    mounted = true;
    return () => { mounted = false }
  }, [])

  const connect = async () => {
    mounted && setError("");
    if (loading) return;
    mounted && setLoading(true);
    let walletResult: ConnectWalletResult;
    errorCatcher(async () => {
      console.log("connect");
      if (privateKey) {
        dispatch({ type: WalletActionTypes.LOAD });
        walletResult = await connectWalletPrivateKey(privateKey);
      } else return;
      if (walletResult) {
        dispatch(actions.Wallet.update({ ...walletResult, pk: privateKey }));
        dispatch(actions.Wallet.update_currency_balance({ currency: "ZIL", balance: walletResult.wallet?.balance }));
      }
    }).finally(() => mounted && setLoading(false));
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <form className={classes.form} noValidate autoComplete="off">
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <InputLabel>Enter a Private Key</InputLabel>
              {error && (
                <InputLabel><Typography color="error">{error}</Typography></InputLabel>
              )}
            </Box>
            <OutlinedInput value={privateKey} onChange={onTextChange} />
            {/* <InputLabel>Enter a Password</InputLabel>
            <OutlinedInput type="password" value={password} onChange={onPasswordChange} /> */}
            <Button onClick={connect} className={classes.submitButton} variant="contained" color="primary">{loading ? <CircularProgress size={14} /> : "Connect"} </Button>
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