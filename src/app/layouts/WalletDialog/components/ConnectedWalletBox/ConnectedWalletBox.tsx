import { Box, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FancyButton } from "app/components";
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, truncate, useNetwork, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import cls from "classnames";
import { ConnectedWallet, WalletConnectType } from "core/wallet";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { ReactComponent as CheckCompleteIcon } from "./check_complete.svg";
// import { ReactComponent as CheckEmptyIcon } from "./check_empty.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
    borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRadius: "0 0 12px 12px"
  },
  walletDetail: {
    margin: theme.spacing(16, 8, 0),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  icon: {
    height: 40,
    width: 40,
    marginRight: theme.spacing(2),
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
    marginTop: 14,
    borderRadius: 12
  },
  newLink: {
    marginTop: 12,
    borderRadius: 12
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
  // transactionsHeader: {
  //   margin: theme.spacing(4, 8, 0),
  //   [theme.breakpoints.down("sm")]: {
  //     margin: theme.spacing(2, 3, 0),
  //   }
  // },
  // transactions: {
  //   padding: theme.spacing(1.5, 8, 8),
  //   [theme.breakpoints.down("sm")]: {
  //     padding: theme.spacing(1.5, 3, 4),
  //   },
  //   "-ms-overflow-style": "none",
  // },
  buttonBox: {
    padding: theme.spacing(16, 8, 2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(16, 3, 2),
    },
  },
  button: {
    padding: "16px",
    marginBottom: 14,
    minHeight: "50px"
  },
  zilpayWallet: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  iconText: {
    marginLeft: 8
  }
}));

type CopyMap = {
  [key: string]: boolean
};

const ConnectedWalletBox = (props: any) => {
  const { className, onBack, icon: Icon } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const wallet = useSelector<RootState, ConnectedWallet | null>(state => state.wallet.wallet);
  // const transactionState = useSelector<RootState, TransactionState>(state => state.transaction);
  const [isLoading] = useTaskSubscriber(...LoadingKeys.connectWallet)
  const [copyMap, setCopyMap] = useState<CopyMap>({});
  const theme = useTheme();
  const isMediaXS = useMediaQuery(theme.breakpoints.down("xs"));

  // const filterTXs = (transaction: Transaction) => {
  //   return transaction.status !== "confirmed";
  // };

  const walletType = useMemo(() => {
    if (!wallet?.type) return undefined;
    switch (wallet?.type) {
      case WalletConnectType.PrivateKey: return "Private Key";
      case WalletConnectType.Zeeves: return "Zeeves Wallet";
      case WalletConnectType.ZilPay: return "ZilPay";
      default: return "Unknown";
    }
  }, [wallet?.type]);

  const onCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyMap({ ...copyMap, [text]: true });
    setTimeout(() => {
      setCopyMap({ ...copyMap, [text]: false });
    }, 500)
  }

  const onDisconnect = () => {
    dispatch(actions.Blockchain.initialize({ wallet: null, network }));
    onBack();
  };

  if (!wallet) return null;
  const address = wallet.addressInfo.byte20;
  const humanAddress = wallet.addressInfo.bech32;
  // const transactions = transactionState.transactions.filter(filterTXs);
  return (
    <Box display="flex" flexDirection="column" className={cls(classes.root, className)}>
      <Box className={classes.walletDetail}>
        <Typography variant="h6">You are connected to</Typography>
        <Box display="flex" alignItems="center" justifyContent="center" className={classes.zilpayWallet}>
          <Icon className={classes.icon} />
          <Typography variant="h1">{walletType}</Typography>
        </Box>
        <Typography variant="h3">{isMediaXS ? truncate(humanAddress, 10, 10) : humanAddress}</Typography>
        <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(humanAddress)} open={!!copyMap[humanAddress]} title="Copied!">
          <IconButton className={classes.copy} size="small">
            <CopyIcon />
            <Typography color="textSecondary" className={classes.iconText}>Copy Address</Typography>
          </IconButton>
        </Tooltip>
        <IconButton target="_blank" href={`https://viewblock.io/zilliqa/address/${address}?network=${network}`} className={classes.newLink} size="small">
          <NewLinkIcon />
          <Typography color="textSecondary" className={classes.iconText}>View on Explorer</Typography>
        </IconButton>
      </Box>

      {/* <Box mt={"36px"} overflow="hidden" display="flex" flexDirection="column">
        <Box className={classes.transactionsHeader}>
          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Typography variant="h4">Transaction History</Typography>
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
        <Box className={classes.transactions}>
          {transactions.map((transaction: Transaction, index: number) => (
            <Box key={index}>
              <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Box display="flex" flexDirection="row" alignItems="center">
                  <Typography variant="body2">0x{truncate(transaction.hash, 10, 10)}</Typography>
                  <IconButton target="_blank" href={`https://viewblock.io/zilliqa/tx/${transaction.hash}?network=${network.toLowerCase()}`} className={classes.newLinkTransaction} size="small">
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
      </Box> */}

      <Box display="flex" flexDirection="column" className={classes.buttonBox}>
        <FancyButton className={classes.button} variant="contained" color="primary">
          View Past Transactions
        </FancyButton>
        <FancyButton fullWidth loading={isLoading} onClick={onDisconnect} className={classes.button} variant="contained" color="primary">
          Disconnect Wallet
        </FancyButton>
      </Box>
    </Box>
  );
};

export default ConnectedWalletBox;
