import { Box, Button, DialogContent, InputLabel, OutlinedInput } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState, useEffect } from "react";
import { ConnectWalletManagerViewProps } from "../../types";
import { ConnectOptionType, ConnectedWallet, ConnectWalletResult } from "core/wallet/ConnectedWallet";
import WalletService from "core/wallet"

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

const ConnectWalletPrivateKey: React.FC<ConnectWalletManagerViewProps & React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, onResult, ...rest } = props;
  const classes = useStyles();
  const [privateKey, setPrivateKey] = useState("");

  const onBack = () => {
    if (typeof onResult === "function")
      onResult(null);
  };

  const onTextChange = (ev:  React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(ev.target.value);
  }

  const toggleConnect = async () => {
    let wallet: ConnectWalletResult;
    let connectedWallet: ConnectedWallet;

    if(privateKey)
      wallet = await WalletService.connectWalletPrivateKey(privateKey);
    else return;

  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <form className={classes.form} noValidate autoComplete="off">
            <InputLabel>Enter a Private Key</InputLabel>
            <OutlinedInput onChange={onTextChange} />
            <Button onClick={toggleConnect} className={classes.submitButton} variant="contained" color="primary">Connect</Button>
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