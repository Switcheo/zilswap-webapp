import { Box, Button, Chip, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { truncate, useTaskSubscriber } from "app/utils";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadableArea from "../LoadableArea";
import { LoadingKeys } from "app/utils/constants";
import { AppTheme } from "app/theme/types";
import { ReactComponent as DotIcon } from "./dot.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    minWidth: 50,
  },
  button: {
    padding: "4px 10px",
    border: "1px solid #00FFB0",
    color: '#DEFFFF',
    marginRight: theme.spacing(2),
    minHeight: 26
  },
  textWhite: {
    color: theme.palette.primary.contrastText,
  },
  mobileButtonBox: {
    padding: theme.spacing(2, 2, 0),
    display: "flex",
    justifyContent: "center",
  },
  mobileButton: {
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: "12px 12px 0 0",
    backgroundColor: theme.palette.type === "dark" ? "#13222C" : "#003340",
    color: theme.palette.tab.selected,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
  },
  mobileButtonConnected: {
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: "12px 12px 0 0",
    backgroundColor: theme.palette.type === "dark" ? "#13222C" : "#003340",
    color: theme.palette.tab.selected,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    justifyContent: "space-between"
  },
  dotIcon: {
    marginRight: theme.spacing(1)
  }
}));

const ConnectWalletButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const classes = useStyles();

  const dispatch = useDispatch();

  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  const [loading] = useTaskSubscriber(...LoadingKeys.connectWallet);

  const onConnectWallet = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <LoadableArea loading={loading}>
        {!wallet && (
          isXs 
          ? <Box className={classes.mobileButtonBox}>
              <Button
              disableElevation
              variant="outlined"
              onClick={onConnectWallet}
              className={classes.mobileButton}>
              Connect Wallet
              </Button>
            </Box>
          : <Button className={classes.button} onClick={onConnectWallet}>Connect</Button>
        )}
        {!!wallet && (
          isXs 
          ? <Box className={classes.mobileButtonBox}>
              <Button
              disableElevation
              variant="outlined"
              onClick={onConnectWallet}
              className={classes.mobileButtonConnected}>
                  <span>Wallet Connected</span>
                  <span><DotIcon className={classes.dotIcon}/>{truncate(wallet!.addressInfo.bech32, 5, 4)}</span>
              </Button>
            </Box>
          : <Chip
            onClick={onConnectWallet}
            color="primary"
            size="small"
            variant="outlined"
            className={classes.button}
            label={(
              <Typography variant="button" className={classes.textWhite}>
                {truncate(wallet!.addressInfo.bech32, 5, isXs ? 2 : 5)}
              </Typography>
            )} />
        )}
      </LoadableArea>
    </Box>
  );
};

export default ConnectWalletButton;
