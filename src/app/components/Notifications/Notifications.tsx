import { Box, CircularProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckmarkIcon from "@material-ui/icons/CheckOutlined";
import TimeoutIcon from "@material-ui/icons/TimerOutlined";
import { actions } from "app/store";
import { RootState, WalletState, SubmittedTx } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { truncate } from "app/utils";
import React from "react";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { ObservedTx } from "zilswap-sdk";
import NotificationBox from "../NotificationBox";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  notificationMessage: {
    fontWeight: 400,
    color: theme.palette.colors.zilliqa.neutral[theme.palette.type === "light" ? "100" : "200"],
  },
  link: {
    cursor: "pointer",
  },
}));

const LoadingIcon = () => {
  return (
    <CircularProgress style={{ display: "block" }} size={20} />
  );
};

const Notifications: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const observingTxs = useSelector<RootState, ObservedTx[]>(state => state.transaction.observingTxs);
  const submittedTxs = useSelector<RootState, SubmittedTx[]>(state => state.transaction.submittedTxs);

  const onRemoveConfirmedTx = (submittedTx: SubmittedTx) => {
    dispatch(actions.Transaction.remove({ hash: submittedTx.hash }));
  };

  const onShowTxDetail = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  if (!walletState.wallet) return null;

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {!!observingTxs.length && (
        <NotificationBox IconComponent={LoadingIcon}>
          <Typography variant="body2" className={classes.notificationMessage}>
            {observingTxs.length} Transaction{observingTxs.length > 1 ? "s" : ""} Confirming.{" "}
            <Typography className={classes.link} component="a" color="primary" onClick={onShowTxDetail}>View detail</Typography>
          </Typography>
        </NotificationBox>
      )}
      {submittedTxs.map((submittedTx: SubmittedTx, index) => (
        <NotificationBox key={index} IconComponent={submittedTx.status === "expired" ? TimeoutIcon: CheckmarkIcon} onRemove={() => onRemoveConfirmedTx(submittedTx)}>
          <Typography variant="body2" className={classes.notificationMessage}>
            Transaction 0x{truncate(submittedTx.hash)} {submittedTx.status || "status unknown"}.{" "}
            {submittedTx.status !== "expired" && (
              <Typography className={classes.link} component="a" color="primary" target="_blank" href={`https://viewblock.io/zilliqa/tx/${submittedTx.hash}?network=testnet`}>
                View on explorer
              </Typography>
            )}
          </Typography>
        </NotificationBox>
      ))}
    </Box>
  );
};

export default Notifications;