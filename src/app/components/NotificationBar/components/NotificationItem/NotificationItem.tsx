import { IconButton, BoxProps, Typography, Box, CircularProgress, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState, useEffect, forwardRef } from "react";
import { truncate, useNetwork } from "app/utils";
import { SnackbarProvider, SnackbarContent, SnackbarKey } from "notistack";
import CloseIcon from "@material-ui/icons/CloseOutlined";
import { RootState, TransactionState } from "app/store/types";
import { useSelector } from "react-redux";
import CheckmarkIcon from "@material-ui/icons/CheckOutlined";
import TimeoutIcon from "@material-ui/icons/TimerOutlined";
import FailIcon from "@material-ui/icons/CancelOutlined";
import PendingIcon from '@material-ui/icons/UpdateOutlined';
import { TxStatus } from "zilswap-sdk";
import LaunchIcon from '@material-ui/icons/Launch';


interface Props extends BoxProps {
  message: string,
  hash: string,
  providerRef: React.MutableRefObject<SnackbarProvider>,
  snackKey: SnackbarKey,
  sourceBlockchain: string,
}

const useStyles = makeStyles((theme: AppTheme) => ({
  icon: {
    fontSize: "16px",
    color: theme.palette.text?.secondary,
  },
  snackbar: {
    background: theme.palette.background.default,
    border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    color: theme.palette.text?.secondary,
    padding: theme.spacing(2),
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    textAlign: "center"
  },
  link: {
    color: theme.palette.text?.secondary,
  },
  linkIcon: {
    marginLeft: 4,
    verticalAlign: "text-bottom",
  },
}));

const LoadingIcon = () => {
  return (
    <CircularProgress style={{ display: "block" }} size={20} />
  );
};

const NotificationItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, message, hash, sourceBlockchain, providerRef, snackKey, className, ...rest } = props;
  const classes = useStyles();
  const network = useNetwork();
  const transactionState = useSelector<RootState, TransactionState>(state => state.transaction);
  const [txStatus, setTxStatus] = useState<TxStatus | "pending" | "submitted">("submitted");

  useEffect(() => {
    transactionState.observingTxs.forEach(tx => {
      if (hash === tx.hash) {
        setTxStatus("pending")
      }
    })

    transactionState.submittedTxs.forEach(tx => {
      if (hash === tx.hash) {
        if (tx.status === "confirmed" && message !== "transaction confirmed") {
          providerRef.current.closeSnackbar(snackKey);
        } else {
          setTxStatus(tx.status);
        }
      }
    })

    // eslint-disable-next-line
  }, [{ ...transactionState.submittedTxs }, { ...transactionState.observingTxs }])

  const onClickDismiss = () => {
    return () => {
      if (providerRef.current) {
        providerRef.current.closeSnackbar(snackKey);
      }
    };
  };

  const getTxStatusIcon = () => {
    switch (txStatus) {
      case 'confirmed':
        return <CheckmarkIcon className={classes.icon} />;
      case 'rejected':
        return <FailIcon className={classes.icon} />;
      case 'expired':
        return <TimeoutIcon className={classes.icon} />;
      case 'pending':
        return <LoadingIcon />;
      default:
        return <PendingIcon className={classes.icon} />;
    }
  }

  const getMessage = () => {
    if (!hash || !sourceBlockchain) return message;
    switch (txStatus) {
      case 'confirmed':
        return "Confirmed";
      case 'rejected':
        return "Rejected";
      case 'expired':
        return "Expired";
      case 'pending':
        return "Confirming";
      default:
        return message;
    }
  }

  const getHref = () => {
    switch (sourceBlockchain) {
      case "swth":
      case "eth": return `https://etherscan.io/search?q=${hash}`
      default: return `https://viewblock.io/zilliqa/tx/${hash}?network=${network.toLowerCase()}`
    }
  }

  return (
    <SnackbarContent {...rest} ref={ref} className={classes.snackbar}>
      {getTxStatusIcon()}
      <Typography>&nbsp;&nbsp;{getMessage()}&nbsp;</Typography>
      {hash &&
        <Typography>
          <Link
            className={classes.link}
            underline="hover"
            rel="noopener noreferrer"
            target="_blank"
            href={getHref()}>
            {"0x"}{truncate(hash)}
            <LaunchIcon className={cls(classes.icon, classes.linkIcon)} />
          </Link>
        </Typography>
      }
      <Box flexGrow={1} />
      <IconButton size="small" onClick={onClickDismiss()}>
        <CloseIcon className={classes.icon} />
      </IconButton>
    </SnackbarContent>
  );
});

export default NotificationItem;
