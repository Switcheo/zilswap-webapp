import { Box, Button, DialogContent, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContrastBox } from "app/components";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
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
  // const dispatch = useDispatch();
  // const [runConnectTask, loadingConnect, errorConnect] = useAsyncTask<void>("connectWalletZilPay");

  const onBack = () => {
    if (typeof onResult === "function")
      onResult(null);
  };

  // const connect = () => {
  //   if (loadingConnect) return;

  //   runConnectTask(async () => {
  //     const zilPay = (window as any).zilPay;
  //     if (typeof zilPay === "undefined")
  //       throw new Error("ZilPay extension not installed");

  //     const result = await zilPay.wallet.connect();
  //     if (result !== zilPay.wallet.isConnect)
  //       throw new Error("ZilPay could not connect.");


  //     console.log(zilPay)
  //     const zilliqa = new Zilliqa("testnet", zilPay.provider);
  //     console.log(zilPay.wallet.defaultAccount.base16)
  //     zilliqa.wallet.setDefault(zilPay.wallet.defaultAccount.base16)
      
  //     console.log(zilliqa.wallet.defaultAccount);


  //     // const walletResult: ConnectWalletResult = await connectWalletZilPay(zilPay);
  //     // if (walletResult.error)
  //     //   throw walletResult.error;

  //     // if (walletResult.wallet) {
  //     //   const { network } = walletResult.wallet!;
  //     //   await ZilswapConnector.connect({
  //     //     network,
  //     //     wallet: walletResult.wallet,
  //     //   });
  //     //   dispatch(actions.Wallet.update({ wallet: walletResult.wallet! }));
  //     // }
  //   });
  // }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <InputLabel>Checking ZilPay Extension</InputLabel>
            {/* {errorConnect && (
              <InputLabel><Typography color="error">{errorConnect.message}</Typography></InputLabel>
            )} */}
          </Box>
          <Typography color="error">Work-in-progress</Typography>
          {/* <FancyButton loading={loadingConnect} onClick={connect} className={classes.submitButton} variant="contained" color="primary">
            Connect
          </FancyButton> */}
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