import { Box, Button, CircularProgress, Menu, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowUpIcon from "@material-ui/icons/ArrowDropUp";
import { actions } from "app/store";
import { RootState, WalletState } from "app/store/types";
import { useAsyncTask, useTaskSubscriber } from "app/utils";
import { LoadingKeys } from "app/utils/contants";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Network } from "zilswap-sdk/lib/constants";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    color: theme.palette.text.primary,
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
    borderRadius: theme.spacing(.5),
    minHeight: theme.spacing(6),
    ...theme.typography.subtitle1,
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    "&.Mui-selected:hover": {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
    },
  },
}));
const NetworkToggle: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
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

  const network = ZilswapConnector.network;
  useEffect(() => {
    // need to listen to wallet state
    // to trigger react component reload
    // when network changes.
  }, [walletState]);

  const onOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const onCloseMenu = () => {
    setMenuAnchor(null);
  };
  const onSelectNetwork = (network: Network) => {
    setMenuAnchor(null);
    if (network === ZilswapConnector.network) return;

    runNetworkChange(async () => {
      await ZilswapConnector.changeNetwork({ network });
      dispatch(actions.Layout.updateNetwork(network));
    });
  };

  const isLoading = loadingNetworkChange || loadingConnectWallet;
  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Button className={classes.button} onClick={onOpenMenu}>
        {!isLoading && (
          <>
            {network} {menuAnchor ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </>
        )}

        {isLoading && (
          <CircularProgress size={16} className={classes.progress} />
        )}

      </Button>
      <Menu
        className={classes.dropdown}
        anchorEl={menuAnchor}
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
