import React, { useEffect } from "react";
import {
  Box,
  Button,
  DialogContent,
  InputLabel,
  Link,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { useDispatch } from "react-redux";
import cls from "classnames";
import { ConnectWalletResult, connectWalletZ3Wallet } from "core/wallet";
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
    },
  },
  backButton: {
    alignSelf: "center",
  },
}));

const ConnectWalletZ3Wallet: React.FC<ConnectWalletManagerViewProps> = (
  props: any
) => {
  const { children, className, onBack: _onBack, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runConnectTask, isCheckingZ3Wallet, errorConnect] = useAsyncTask<void>(
    "connectWalletZ3Wallet"
  );
  const [isLoading] = useTaskSubscriber(...LoadingKeys.connectWallet);

  const onBack = () => {
    if (isLoading) return;
    _onBack(null);
  };

  const connect = () => {
    runConnectTask(async () => {
      if (isLoading) return;

      const z3Wallet = (window as any).z3Wallet;
      if (typeof z3Wallet === "undefined")
        throw new Error("Z3Wallet extension not installed");

      const result = await z3Wallet.wallet.connect();
      if (result !== z3Wallet.wallet.isConnect)
        throw new Error("Z3Wallet could not be connected to.");

      const walletResult: ConnectWalletResult = await connectWalletZ3Wallet(
        z3Wallet
      );
      if (walletResult.error) throw walletResult.error;

      if (walletResult.wallet) {
        const { wallet } = walletResult;
        const { network } = wallet;
        dispatch(actions.Blockchain.initialize({ network, wallet }));
      }
    });
  };

  // auto-click connect
  useEffect(() => {
    connect();
    // eslint-disable-next-line
  }, []);

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <ContrastBox className={classes.container}>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            {isCheckingZ3Wallet && (
              <InputLabel>Checking Z3Wallet Extension</InputLabel>
            )}
            {errorConnect && (
              <Box>
                <InputLabel>
                  <Typography color="error">{errorConnect.message}</Typography>
                </InputLabel>
                <br />
                <Typography color="textPrimary" variant="body2" align="center">
                  New to Z3Wallet? Download it{" "}
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://chrome.google.com/webstore/detail/z3-wallet/igmjhgecjbiibcjohmlhgjdalnfmlejg"
                  >
                    here
                  </Link>
                  !
                </Typography>
              </Box>
            )}
          </Box>
          <FancyButton
            fullWidth
            loading={isLoading}
            onClick={connect}
            className={classes.submitButton}
            variant="contained"
            color="primary"
          >
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

export default ConnectWalletZ3Wallet;
