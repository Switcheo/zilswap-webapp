import { Box, Button, ButtonProps, CircularProgress, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { actions } from "app/store";
import { RootState, WalletState } from "app/store/types";
import { useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/contants";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

export interface FancyButtonProps extends ButtonProps {
  loading?: boolean;
  walletRequired?: boolean;
  loadingTxApprove?: boolean;
  showTxApprove?: boolean;
  onClickTxApprove?: () => any;
};

const useStyles = makeStyles(theme => ({
  confirmButton: {
    flexGrow: 1,
  },
  progress: {
    color: "rgba(255,255,255,.8)",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  unlockButton: {
    width: "100%",
    marginRight: theme.spacing(1),
  },
}));
const FancyButton: React.FC<FancyButtonProps> = (props: any) => {
  const { children, loading, className, walletRequired, disabled, loadingTxApprove, showTxApprove, onClickTxApprove, onClick, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const [loadingConnectWallet] = useTaskSubscriber(...LoadingKeys.connectWallet);

  const onButtonClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (loading) return;

    if (walletRequired && !walletState.wallet)
      return dispatch(actions.Layout.toggleShowWallet("open"));


    return typeof onClick === "function" && onClick(e);
  };

  // override children content if wallet required
  // and not connected.
  const buttonContent = walletRequired ?
    (!walletState.wallet ? "Connect Wallet" : children) :
    (children);

  // override button disabled state if wallet required
  // and not connected.
  const buttonDisabled = walletRequired ?
    (!walletState.wallet ? false : disabled) :
    (disabled);

  // override button loading state if wallet required
  // and loading state for walletConnect is active.
  const buttonLoading = walletRequired ?
    (!walletState.wallet ? loadingConnectWallet : loading) :
    (loading);
  return (
    <Box display="flex">
      {(showTxApprove && walletState.wallet) && (
        <Tooltip title="Transaction needs to be approved before swapping or adding liquidity">
          <Button onClick={onClickTxApprove} disabled={buttonDisabled} className={cls(classes.unlockButton, className)} color="primary" variant="contained">
            {!loadingTxApprove && "Approve"}
            {!!loadingTxApprove && (
              <CircularProgress size={24} className={classes.progress} />
            )}
          </Button>
        </Tooltip>
      )}
      <Button {...rest} disabled={buttonDisabled || showTxApprove} className={cls(classes.confirmButton, className)} onClick={onButtonClick}>
        {!buttonLoading && buttonContent}
        {!!buttonLoading && (
          <CircularProgress size={24} className={classes.progress} />
        )}
      </Button>
    </Box>
  );
};

export default FancyButton;