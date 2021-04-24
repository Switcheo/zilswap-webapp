import { Box, Divider, CircularProgress, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ContrastBox } from "app/components";
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { RootState, Transaction, TransactionState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useAsyncTask, useNetwork } from "app/utils";
import cls from "classnames";
import { ConnectedWallet, WalletConnectType } from "core/wallet";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as CheckCompleteIcon } from "./check_complete.svg";
import { ReactComponent as CheckEmptyIcon } from "./check_empty.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  walletDetail: {
    display: "flex",
    flexDirection: "row",
    margin: theme.spacing(4, 8, 0),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(2, 3, 0),
    }
  },
  icon: {
    height: 40,
    width: 40,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    }
  },
  label: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  info: {
    marginRight: 8,
  },
  copy: {
    marginLeft: 10,
  },
  newLink: {
    marginLeft: 4,
  },
  newLinkTransaction: {
    marginLeft: 6,
    height: 10,
  },
  divider: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`,
  },
  rowHeader: {
    marginTop: 2,
    marginBottom: 0,
  },
  checkbox: {
    marginRight: 6
  },
  logout: {
    cursor: "pointer"
  },
  transactionsHeader: {
    margin: theme.spacing(4, 8, 0),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(2, 3, 0),
    }
  },
  transactions: {
    padding: theme.spacing(1.5, 8, 8),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.5, 3, 4),
    },
    "-ms-overflow-style": "none",
  }

}));

type CopyMap = {
  [key: string]: boolean
};

const ConnectedWalletBox = (props: any) => {
  const { onLogout, className, icon: Icon } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const wallet = useSelector<RootState, ConnectedWallet | undefined>(state => state.wallet.wallet);
  const transactionState = useSelector<RootState, TransactionState>(state => state.transaction);
  const [runDisconnectZilswap, loadingDisconnectZilswap] = useAsyncTask<void>("disconnectZilswap");
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [copyMap, setCopyMap] = useState<CopyMap>({});
  const theme = useTheme();
  const is_xs_media = useMediaQuery(theme.breakpoints.down("xs"));

  const formatStatusLabel = (status: string) => {
    if (!status) return "Unknown";
    return `${status.charAt(0).toUpperCase()}${status.substring(1)}`;
  };

  const filterTXs = (transaction: Transaction) => {
    if (includeCompleted) return true;
    return transaction.status !== "confirmed";
  };

  const onCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMap({ ...copyMap, [text]: true });
    setTimeout(() => {
      setCopyMap({ ...copyMap, [text]: false });
    }, 500)
  }

  const onDisconnect = () => {
    if (loadingDisconnectZilswap) return;
    runDisconnectZilswap(async () => {
      await ZilswapConnector.initialise();
      dispatch(actions.Wallet.logout());
      if (typeof onLogout === "function") onLogout();
    });
  };

  if (!wallet) return null;
  const address = wallet.addressInfo.byte20;
  const humanAddress = wallet.addressInfo.bech32;
  const transactions = transactionState.transactions.filter(filterTXs);
  return (
    <Box display="flex" flexDirection="column" className={cls(classes.root, className)}>
      <ContrastBox className={classes.walletDetail}>
        <Icon className={classes.icon} />
        <Box className={classes.label}>
          <Typography variant="h3">Connected to {wallet.type === WalletConnectType.PrivateKey ? "Private Key" : WalletConnectType[wallet.type]}</Typography>
          <Box mt={"8px"} display="flex" flexDirection="row" alignItems="center">
            <Typography color="textSecondary" variant="body1">{is_xs_media ? truncate(humanAddress, 10, 10) : humanAddress}</Typography>
            <IconButton target="_blank" href={`https://viewblock.io/zilliqa/address/${address}?network=${network}`} className={classes.newLink} size="small"><NewLinkIcon /></IconButton>
            <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(humanAddress)} open={!!copyMap[humanAddress]} title="Copied!">
              <IconButton className={classes.copy} size="small"><CopyIcon /></IconButton>
            </Tooltip>
          </Box>
          <Box display="flex" flexDirection="row" marginTop={1}>
            <Typography className={cls(classes.info, classes.logout)} onClick={onDisconnect} color="primary" variant="body1">
              Disconnect
            </Typography>
            {loadingDisconnectZilswap && <CircularProgress size={12} />}
          </Box>
        </Box>
      </ContrastBox>
      <Box mt={"36px"} overflow="hidden" display="flex" flexDirection="column">
        <Box className={classes.transactionsHeader}>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h3">Transaction History</Typography>
            <Box display="flex" flexDirection="row" alignItems="center">
              {includeCompleted && (<IconButton size="small" className={classes.checkbox} onClick={() => setIncludeCompleted(false)}><CheckCompleteIcon /></IconButton>)}
              {!includeCompleted && (<IconButton size="small" className={classes.checkbox} onClick={() => setIncludeCompleted(true)}><CheckEmptyIcon /></IconButton>)}
              <Typography color="textSecondary" variant="body2">
                Include Completed
              </Typography>
            </Box>
          </Box>
          <Box mt={"28px"}>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Typography color="textSecondary" variant="body2">Transaction ID</Typography>
              <Typography color="textSecondary" variant="body2">Status</Typography>
            </Box>
            <Divider className={cls(classes.divider, classes.rowHeader)} />
          </Box>
        </Box>
        <Box overflow="scroll" className={classes.transactions}>
          {transactions.map((transaction: Transaction, index: number) => (
            <Box key={index}>
              <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Box display="flex" flexDirection="row" alignItems="center">
                  <Typography variant="body2">0x{truncate(transaction.hash, 10, 10)}</Typography>
                  <IconButton target="_blank" href={`https://viewblock.io/zilliqa/tx/${transaction.hash}?network=${network}`} className={classes.newLinkTransaction} size="small">
                    <NewLinkIcon />
                  </IconButton>
                  <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(transaction.hash)} open={!!copyMap[transaction.hash]} title="Copied!">
                    <IconButton className={classes.copy} size="small">
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2">{formatStatusLabel(transaction.status)}</Typography>
              </Box>
              <Divider className={cls(classes.divider)} />
            </Box>
          ))}
          {!transactions.length && (
            <Typography align="center" variant="body2" color="textSecondary">No transactions found.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConnectedWalletBox;
