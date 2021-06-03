import { Box, Button, DialogContent, InputLabel, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import cls from "classnames";
import { ContrastBox, FancyButton } from "app/components";
import { actions } from "app/store";
import { AppTheme } from "app/theme/types";
import { useAsyncTask, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import {ConnectWalletResult, connectWalletZeeves} from "core/wallet";
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

const ConnectWalletZeeves: React.FC<ConnectWalletManagerViewProps> = (props: any) => {
  const { children, className, onBack: _onBack, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [runConnectTask, isConnectingZeeves, errorConnect] = useAsyncTask<void>("connectWalletZeeves");
  const [isLoading] = useTaskSubscriber(...LoadingKeys.connectWallet);

  // auto-click connect
  useEffect(() => {
    connect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onBack = () => {
    if (isLoading) return;
    _onBack(null);
  };

  const connect = () => {
    runConnectTask(async () => {
      if (isLoading) return;

      const zeeves = (window as any).Zeeves;
      if (!zeeves) {
        throw new Error("Zeeves is not supported");
      }

      await zeeves.auth();

      const walletResult: ConnectWalletResult = await connectWalletZeeves(zeeves);
      if (walletResult.error) {
        throw walletResult.error;
      }

      if (walletResult.wallet) {
        const { wallet } = walletResult
        const { network } = wallet
        dispatch(actions.Blockchain.initialize({ network, wallet }))
      }
    });
  }

  return (
      <Box {...rest} className={cls(classes.root, className)}>
        <DialogContent>
          <ContrastBox className={classes.container}>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              {isConnectingZeeves && (
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

export default ConnectWalletZeeves;
