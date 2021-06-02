import { Box, Button, CircularProgress, Menu, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { actions } from "app/store";
import { RootState, WalletState } from "app/store/types";
import { useAsyncTask, useTaskSubscriber, useNetwork } from "app/utils";
import { LoadingKeys } from "app/utils/constants";
import cls from "classnames";
import { WalletConnectType } from "core/wallet";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Network } from "zilswap-sdk/lib/constants";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  button: {
    color: theme.palette.primary.dark,
    border: `1px solid ${theme.palette.primary.dark}`,
    borderRadius: "20px",
    fontSize: "12px",
    padding: "2px 16px"
  },
  progress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -8,
    marginLeft: -8,
  },
  dropdown: {
    "& .MuiMenu-list": {
      padding: theme.spacing(.5),
    },
  },
  dropdownItem: {
    minWidth: 116,
    justifyContent: "center",
    borderRadius: "12px",
    minHeight: theme.spacing(6),
    ...theme.typography.subtitle1,
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderRadius: "12px"
    },
    "&.Mui-selected:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderRadius: "12px"
    },
  },
}));
const NetworkToggle: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const network = useNetwork();
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const [runNetworkChange, loadingNetworkChange, errorNetworkChange, clearError] = useAsyncTask("networkChange");
  const [loadingConnectWallet] = useTaskSubscriber(...LoadingKeys.connectWallet);

  useEffect(() => {
    if (errorNetworkChange) {
      dispatch(actions.Layout.updateNotification({
        type: "",
        message: "Network change failed, check console for details.",
      }));
      console.error(errorNetworkChange);
      clearError();
    }

    // eslint-disable-next-line
  }, [errorNetworkChange, clearError]);

  const onOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const onCloseMenu = () => {
    setMenuAnchor(null);
  };
  const onSelectNetwork = (newNetwork: Network) => {
    setMenuAnchor(null);
    if (newNetwork === network) return;

    runNetworkChange(async () => {
      const { wallet } = walletState
      if (wallet?.type === WalletConnectType.ZilPay) {
        dispatch(actions.Layout.updateNotification({
          type: "",
          message: "Please change network using your ZilPay wallet.",
        }));
        return
      }
      dispatch(actions.Blockchain.initialize({ wallet, network: newNetwork }))
    });
  };

  const isLoading = loadingNetworkChange || loadingConnectWallet;
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Button className={classes.button} onClick={onOpenMenu}>
        { !isLoading
          ? <>{network.toUpperCase()}</>
          : <CircularProgress size={16} />
        }
      </Button>
      <Menu
        className={classes.dropdown}
        anchorEl={menuAnchor}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        keepMounted
        open={!!menuAnchor}
        onClose={onCloseMenu}>
        {Object.values(Network).map((option, index) => (
          <MenuItem
            className={classes.dropdownItem}
            selected={network === option}
            key={index}
            onClick={() => onSelectNetwork(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default NetworkToggle;
