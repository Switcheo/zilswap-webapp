import { Box, CircularProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckmarkIcon from "@material-ui/icons/CheckOutlined";
import TimeoutIcon from "@material-ui/icons/TimerOutlined";
import FailIcon from "@material-ui/icons/CancelOutlined";
import PendingIcon from '@material-ui/icons/UpdateOutlined';
import { actions } from "app/store";
import { LayoutState, PoolFormState, RootState, SubmittedTx, SwapFormState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { truncate, useNetwork } from "app/utils";
import cls from "classnames";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router";
import { ObservedTx, TxStatus } from "zilswap-sdk";
import NotificationBox from "../NotificationBox";
import UserPoolMessage from "../UserPoolMessage";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  notificationMessage: {
    fontWeight: 400,
    margin: theme.spacing(0, 1),
    color: theme.palette.colors.zilliqa.neutral[theme.palette.type === "light" ? "200" : "100"],
  },
  link: {
    marginLeft: 2,
    cursor: "pointer",
    color: theme.palette.primary.dark,
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
  const network = useNetwork();
  const isSwap = useRouteMatch({ path: "/swap" })
  const isPool = useRouteMatch({ path: "/pool" })

  const layoutState = useSelector<RootState, LayoutState>(state => state.layout);
  const poolState = useSelector<RootState, PoolFormState>(state => state.pool);
  const swapState = useSelector<RootState, SwapFormState>(state => state.swap);
  const observingTxs = useSelector<RootState, ObservedTx[]>(state => state.transaction.observingTxs);
  const submittedTxs = useSelector<RootState, SubmittedTx[]>(state => state.transaction.submittedTxs);

  const poolToken = poolState.token;
  const { inToken, outToken } = swapState;

  let userToken = null;
  if (isPool && poolToken && !poolToken.whitelisted)
    userToken = poolToken;
  else if (isSwap && inToken && !inToken.isZil && !inToken.whitelisted)
    userToken = inToken;
  else if (isSwap && outToken && !outToken.isZil && !outToken.whitelisted)
    userToken = outToken;

  const onRemoveNotification = () => {
    dispatch(actions.Layout.updateNotification(undefined));
  };

  const onRemoveConfirmedTx = (submittedTx: SubmittedTx) => {
    dispatch(actions.Transaction.remove({ hash: submittedTx.hash }));
  };

  const onShowTxDetail = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  const txStatusIcon = (status: TxStatus | "pending") => {
    switch (status) {
      case 'confirmed':
        return CheckmarkIcon;
      case 'rejected':
        return FailIcon;
      case 'expired':
        return TimeoutIcon;
      case 'pending':
        return PendingIcon;
      default:
        throw new Error("Unknown tx status!")
    }
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {userToken && (
        isPool ?
          <UserPoolMessage token={userToken}>
            Liquidity pools created by other users are not screened by Zilswap.
            All tokens (including ZIL) deposited to the pool may be lost if the ZRC-2 token contract
            is malicious or otherwise exploited.
            Please verify the legitimacy of this token yourself before contributing liquidity.
          </UserPoolMessage>
          :
          <UserPoolMessage token={userToken}>
            ZRC-2 tokens issued by other users are not screened or audited by Zilswap.
            There is no guarantee that your purchased tokens will remain tradable or maintain any value.
            Please verify the legitimacy of this token yourself before swapping.
          </UserPoolMessage>
      )}
      {!!layoutState.notification && (
        <NotificationBox onRemove={() => onRemoveNotification()}>
          <Typography variant="body2" className={classes.notificationMessage}>
            {layoutState.notification!.message}
          </Typography>
        </NotificationBox>
      )}
      {!!observingTxs.length && (
        <NotificationBox IconComponent={LoadingIcon}>
          <Typography variant="body2" className={classes.notificationMessage}>
            {observingTxs.length} Transaction{observingTxs.length > 1 ? "s" : ""} confirming.{" "}
            <Typography className={classes.link} component="a" onClick={onShowTxDetail}>View detail</Typography>
          </Typography>
        </NotificationBox>
      )}
      {submittedTxs.map((submittedTx: SubmittedTx, index) => (
        <NotificationBox
          key={index}
          IconComponent={txStatusIcon(submittedTx.status)}
          onRemove={() => onRemoveConfirmedTx(submittedTx)}
        >
          <Typography variant="body2" className={classes.notificationMessage}>
            Transaction 0x{truncate(submittedTx.hash)} {submittedTx.status || "status unknown"}.{" "}
            {submittedTx.status !== "expired" && (
              <Typography className={classes.link} component="a" target="_blank" href={`https://viewblock.io/zilliqa/tx/${submittedTx.hash}?network=${network.toLowerCase()}`}>
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
