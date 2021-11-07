import React from "react";
import { Box, Button, Chip, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { ConnectedWallet } from "core/wallet";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { hexToRGBA, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import { AppTheme } from "app/theme/types";
import { truncateAddress } from "app/utils";
import LoadableArea from "../LoadableArea";
import { ReactComponent as DotIcon } from "./dot.svg";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  connectText?: string;
}

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
    border: theme.palette.border,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "" : `rgba${hexToRGBA("#003340", 0.8)}`
    }
  },
  mobileButtonConnected: {
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: "12px 12px 0 0",
    backgroundColor: theme.palette.type === "dark" ? "#13222C" : "#003340",
    color: theme.palette.tab.selected,
    border: theme.palette.border,
    justifyContent: "space-between",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "" : `rgba${hexToRGBA("#003340", 0.8)}`
    }
  },
  dotIcon: {
    marginRight: theme.spacing(1)
  }
}));

const ConnectWalletButton: React.FC<Props> = (props: Props) => {
  const { connectText = "Connect", children, className, ...rest } = props;
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
            : <Button className={classes.button} onClick={onConnectWallet}>{connectText}</Button>
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
                <span><DotIcon className={classes.dotIcon} />{truncateAddress(wallet!.addressInfo.bech32)}</span>
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
                  {truncateAddress(wallet!.addressInfo.bech32, isXs)}
                </Typography>
              )} />
        )}
      </LoadableArea>
    </Box>
  );
};

export default ConnectWalletButton;
