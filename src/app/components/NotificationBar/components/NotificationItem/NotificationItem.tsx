import { Box, BoxProps, CircularProgress, IconButton, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FailIcon from "@material-ui/icons/CancelOutlined";
import CheckmarkIcon from "@material-ui/icons/CheckOutlined";
import CloseIcon from "@material-ui/icons/CloseOutlined";
import LaunchIcon from '@material-ui/icons/Launch';
import TimeoutIcon from "@material-ui/icons/TimerOutlined";
import { BridgeState, RootState, TransactionState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { truncate, useNetwork } from "app/utils";
import cls from "classnames";
import { SnackbarContent, SnackbarKey, SnackbarProvider } from "notistack";
import React, { forwardRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TxStatus } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";

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
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
  const [txStatus, setTxStatus] = useState<TxStatus | "pending" | "submitted" | undefined>();

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

    bridgeState.bridgeTxs.forEach(tx => {
      if (hash === tx.sourceTxHash) {
        if (tx.depositTxConfirmedAt) {
          setTxStatus("confirmed");
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

  const checkMessage = () => {
    if (message.includes("reject")) return "rejected";
    if (message.includes("expire")) return "expired";
  }

  const getTxStatusIcon = () => {
    switch (txStatus || checkMessage()) {
      case 'confirmed':
        return <CheckmarkIcon className={classes.icon} />;
      case 'rejected':
        return <FailIcon className={classes.icon} />;
      case 'expired':
        return <TimeoutIcon className={classes.icon} />;
      case 'pending':
        return <LoadingIcon />;
      default:
        return;
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
      case "eth": return network === Network.MainNet ? `https://etherscan.io/search?q=${hash}` : `https://ropsten.etherscan.io/search?q=${hash}`;
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
