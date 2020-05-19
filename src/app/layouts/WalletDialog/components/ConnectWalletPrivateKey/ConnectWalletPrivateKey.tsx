import { Box, Button, CircularProgress, DialogContent, InputLabel, OutlinedInput, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox } from "app/components";
import { actions } from "app/store";
import { WalletActionTypes } from "app/store/wallet/actions";
import { AppTheme } from "app/theme/types";
import { useErrorCatcher } from "app/utils";
import cls from "classnames";
import WalletService from "core/wallet";
import { ConnectedWallet, ConnectWalletResult } from "core/wallet/ConnectedWallet";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ConnectWalletManagerViewProps } from "../../types";
import { BigNumber } from "bignumber.js";
import { getZilliqa } from "core/zilliqa";

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
  const [password, setPassword] = useState("");
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

  const onPasswordChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(ev.target.value);
  }

  useEffect(() => {
    mounted = true;
    return () => { mounted = false }
  }, [])

  const connect = async () => {
    mounted && setError("");
    if (loading) return;
    mounted && setLoading(true);
    let wallet: ConnectWalletResult;
    errorCatcher(async () => {
      if (privateKey) {
        dispatch({ type: WalletActionTypes.LOAD });
        wallet = await WalletService.connectWalletPrivateKey(privateKey);
      } else return;
      if (wallet) {
        dispatch(actions.Wallet.update({ ...wallet, currencies: { ZIL: +(wallet.wallet!.balance) }, pk: privateKey }));
        await getPool();
      }
    }).finally(() => mounted && setLoading(false));
  }

  const getPool = async () => {
    const zilliqa = getZilliqa();
    await zilliqa.initialize();
    const pool = await zilliqa.getPool("ITN");
    let { contributionPercentage, exchangeRate, tokenReserve, totalContribution, userContribution, zilReserve } = pool;

    console.log("contributionPercentage", new BigNumber(contributionPercentage).toString());
    console.log("exchangeRate", new BigNumber(exchangeRate).toString());
    console.log("tokenReserve", new BigNumber(tokenReserve).toString());
    console.log("totalContribution", new BigNumber(totalContribution).toString());
    console.log("userContribution", new BigNumber(userContribution).toString());
    console.log("zilReserve", new BigNumber(zilReserve).toString());

    contributionPercentage = new BigNumber(contributionPercentage).toString();
    exchangeRate = new BigNumber(exchangeRate).toString();
    tokenReserve = new BigNumber(tokenReserve).toString();
    totalContribution = new BigNumber(totalContribution).shiftedBy(-12).toString();
    userContribution = new BigNumber(userContribution).toString();
    zilReserve = new BigNumber(zilReserve).toString();

    dispatch(actions.Pool.update_pool({ contributionPercentage, exchangeRate, tokenReserve, totalContribution, userContribution, zilReserve }));
    await zilliqa.teardown();
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