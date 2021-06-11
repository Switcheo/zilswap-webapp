import { Box, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FancyButton } from "app/components";
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { hexToRGBA, truncate, useNetwork, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import cls from "classnames";
import { ConnectedWallet, WalletConnectType } from "core/wallet";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles(theme => ({
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
  checkbox: {
    marginRight: 6
  },
  logout: {
    cursor: "pointer"
  },
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
  },
  icons: {
    "& path": {
      fill: `rgba${hexToRGBA(theme.palette.text.primary, 0.5)}`
    }
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
  const [isLoading] = useTaskSubscriber(...LoadingKeys.connectWallet)
  const [copyMap, setCopyMap] = useState<CopyMap>({});
  const theme = useTheme();
  const isMediaXS = useMediaQuery(theme.breakpoints.down("xs"));

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
  return (
    <Box display="flex" flexDirection="column" className={cls(classes.root, className)}>
      <Box className={classes.walletDetail}>
        <Typography variant="h4">You are connected to</Typography>
        <Box display="flex" alignItems="center" justifyContent="center" className={classes.zilpayWallet}>
          <Icon className={classes.icon} />
          <Typography variant="h1">{walletType}</Typography>
        </Box>
        <Typography variant="h3">{isMediaXS ? truncate(humanAddress, 10, 10) : humanAddress}</Typography>
        <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(humanAddress)} open={!!copyMap[humanAddress]} title="Copied!">
          <IconButton className={classes.copy} size="small">
            <CopyIcon className={classes.icons}/>
            <Typography color="textSecondary" className={classes.iconText}>Copy Address</Typography>
          </IconButton>
        </Tooltip>
        <IconButton target="_blank" href={`https://viewblock.io/zilliqa/address/${address}?network=${network}`} className={classes.newLink} size="small">
          <NewLinkIcon className={classes.icons}/>
          <Typography color="textSecondary" className={classes.iconText}>View on Explorer</Typography>
        </IconButton>
      </Box>

      <Box display="flex" flexDirection="column" className={classes.buttonBox}>
        <FancyButton onClick={() => {dispatch(actions.Layout.toggleShowWallet()); dispatch(actions.Layout.toggleShowTransactions())}} className={classes.button} variant="contained" color="primary">
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
