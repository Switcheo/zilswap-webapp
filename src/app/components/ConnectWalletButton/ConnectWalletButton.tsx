import { Box, Button, Chip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { truncate, useTaskSubscriber } from "app/utils";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadableArea from "../LoadableArea";
import { ReactComponent as DotIcon } from "./dot.svg";
import { LoadingKeys } from "app/utils/contants";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 50,
  },
  dotIcon: {
    marginRight: theme.spacing(1)
  },
}));

const ConnectWalletButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  const dispatch = useDispatch();

  const wallet = useSelector<RootState, ConnectedWallet | undefined>(state => state.wallet.wallet);
  const [loading] = useTaskSubscriber(...LoadingKeys.connectWallet);

  const onConnectWallet = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <LoadableArea loading={loading}>
        {!wallet && (
          <Button onClick={onConnectWallet}>Connect Wallet</Button>
        )}
        {!!wallet && (
          <Chip
            onClick={onConnectWallet}
            color="primary"
            size="small"
            variant="outlined"
            label={(
              <Typography variant="button" color="textPrimary">
                <DotIcon className={classes.dotIcon} />{truncate(wallet!.addressInfo.bech32)}
              </Typography>
            )} />
        )}
      </LoadableArea>
    </Box>
  );
};

export default ConnectWalletButton;
