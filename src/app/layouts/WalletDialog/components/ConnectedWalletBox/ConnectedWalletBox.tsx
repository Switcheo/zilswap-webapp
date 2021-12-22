import React, { useMemo, useState } from "react";
import { Box, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { ConnectedWallet, WalletConnectType } from "core/wallet";
import { FancyButton } from "app/components";
import { ReactComponent as CopyIcon } from "app/components/copy.svg";
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import RewardsInfoButton from "app/layouts/RewardsInfoButton"
import { actions } from "app/store";
import { RootState } from "app/store/types";
import { hexToRGBA, truncate, useNetwork, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import { AppTheme } from "app/theme/types";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    overflow: "hidden",
    backgroundColor: theme.palette.background!.default,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderBottom: theme.palette.border,
    borderRadius: "0 0 12px 12px"
  },
  walletDetail: {
    margin: theme.spacing(8, 8, 0),
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
    padding: theme.spacing(8, 8, 2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(8, 3, 2),
    },
  },
  button: {
    padding: "16px",
    marginBottom: 14,
    minHeight: "50px"
  },
  rewardButton: {
    padding: "16px",
    marginBottom: 14,
    minHeight: "50px",
    backgroundColor: "#FFDF6B",
    color: "#003340",
    borderRadius: theme.spacing(1.5),
    "&.MuiButtonBase-root": {
      "&:hover": {
        opacity: 0.8,
        backgroundColor: "#FFDF6B",
      }
    }
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
      fill: `rgba${hexToRGBA(theme.palette.text!.primary!, 0.5)}`
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

  const walletName = useMemo(() => {
    switch (wallet?.type) {
      case WalletConnectType.PrivateKey: return "Private Key";
      case WalletConnectType.Zeeves: return "Zeeves Wallet";
      case WalletConnectType.ZilPay: return "ZilPay";
      case WalletConnectType.BoltX: return "BoltX";
      default: return "Unknown Wallet";
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
  const humanAddress = wallet?.type === WalletConnectType.BoltX ? toBech32Address(address) : wallet.addressInfo.bech32;

  return (
    <Box display="flex" flexDirection="column" className={cls(classes.root, className)}>
      <Box className={classes.walletDetail}>
        <Typography variant="h4">You are connected to</Typography>
        <Box display="flex" alignItems="center" justifyContent="center" className={classes.zilpayWallet}>
          <Icon className={classes.icon} />
          <Typography variant="h1">{walletName}</Typography>
        </Box>
        <Typography variant="h3">{isMediaXS ? truncate(humanAddress, 10, 10) : humanAddress}</Typography>
        <Tooltip placement="top" onOpen={() => { }} onClose={() => { }} onClick={() => onCopy(humanAddress)} open={!!copyMap[humanAddress]} title="Copied!">
          <IconButton className={classes.copy} size="small">
            <CopyIcon className={classes.icons} />
            <Typography color="textSecondary" className={classes.iconText}>Copy Address</Typography>
          </IconButton>
        </Tooltip>
        <IconButton target="_blank" href={`https://viewblock.io/zilliqa/address/${address}?network=${network.toLowerCase()}`} className={classes.newLink} size="small">
          <NewLinkIcon className={classes.icons} />
          <Typography color="textSecondary" className={classes.iconText}>View on Explorer</Typography>
        </IconButton>
      </Box>

      <Box display="flex" flexDirection="column" className={classes.buttonBox}>
        {isMediaXS && (<RewardsInfoButton buttonMode={true} />)}
        <FancyButton onClick={() => { dispatch(actions.Layout.toggleShowWallet()); dispatch(actions.Layout.toggleShowTransactions()) }} className={classes.button} variant="contained" color="primary">
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
