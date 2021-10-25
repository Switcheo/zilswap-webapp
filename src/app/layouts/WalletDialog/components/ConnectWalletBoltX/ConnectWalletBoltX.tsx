import React, { useEffect } from "react";
import { Box, Button, DialogContent, InputLabel, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { useDispatch } from "react-redux";
import cls from "classnames";
import { ConnectWalletResult, connectWalletBoltX } from "core/wallet";
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
  submitButton: {
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

const ConnectWalletBoltX: React.FC<ConnectWalletManagerViewProps> = (props: any) => {
  const { children, className, onBack: _onBack, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runConnectTask, isCheckingBoltX, errorConnect] = useAsyncTask<void>("connectWalletBoltX");
  const [isLoading] = useTaskSubscriber(...LoadingKeys.connectWallet);

  const onBack = () => {
    if (isLoading) return;
    _onBack(null);
  };

  const connect = () => {
    runConnectTask(async () => {
      if (isLoading) return;

      const boltX = (window as any).boltX;
      if (typeof boltX === "undefined") {
        throw new Error("BoltX wallet extension not installed");
      }

      const result = await boltX.zilliqa.wallet.connect();
      if (result !== boltX.zilliqa.wallet.isConnected) {
        throw new Error("Failed to connect to BoltX");
      }

      const walletResult: ConnectWalletResult = await connectWalletBoltX(boltX);
      if (walletResult.error) {
        throw walletResult.error;
      }

      if (walletResult.wallet) {
        const { wallet } = walletResult
        const { network } = wallet
        dispatch(actions.Blockchain.initialize({ network, wallet }))
      }

      throw new Error("Failed to connect to BoltX");
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
            {isCheckingBoltX && (
              <InputLabel>Checking BoltX Extension</InputLabel>
            )}
            {errorConnect && (
              <Box>
                <InputLabel>
                  <Typography color="error">{errorConnect.message}</Typography>
                </InputLabel>
                <br />
                <Typography color="textPrimary" variant="body2" align="center">
                  New to BoltX? Download it
                  {" "}
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://chrome.google.com/webstore/detail/bolt-x/aodkkagnadcbobfpggfnjeongemjbjca">
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

export default ConnectWalletBoltX;
