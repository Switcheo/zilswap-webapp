import { Box, Button, DialogContent, InputLabel, OutlinedInput, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import cls from "classnames";
import { ContrastBox, FancyButton } from "app/components";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useNetwork, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import { connectWalletPrivateKey } from "core/wallet";
import { ConnectWalletResult } from "core/wallet/ConnectedWallet";
import { ConnectWalletManagerViewProps } from "../../types";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF", 
    borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF", 
    borderRadius: "0 0 12px 12px"
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
  const { children, className, onBack: _onBack, ...rest } = props;
  const [privateKey, setPrivateKey] = useState("");
  const [runConnectTask, , errorConnect] = useAsyncTask<void>("connectWalletPrivateKey");
  const [isLoading] = useTaskSubscriber(...LoadingKeys.connectWallet)
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();

  const onBack = () => {
    if (isLoading) return;
    _onBack(null);
  };

  const onTextChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(ev.target.value);
  }

  const connect = () => {
    if (isLoading) return;

    runConnectTask(async () => {
      const walletResult: ConnectWalletResult = await connectWalletPrivateKey(privateKey, network);
      if (walletResult.error)
        throw walletResult.error;

      if (walletResult.wallet) {
        dispatch(actions.Blockchain.initialize({ wallet: walletResult.wallet!, network }));
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
            <FancyButton fullWidth loading={isLoading} onClick={connect} className={classes.submitButton} variant="contained" color="primary">
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
