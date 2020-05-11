import { AppBar, Box, Button, IconButton, Toolbar, Chip, Badge, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Brand } from "app/components/TopBar/components";
import { actions } from "app/store";
import { RootState } from "app/store/types";
import cls from "classnames";
import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import ThemeSwitch from "../ThemeSwitch";
import { ReactComponent as MenuIcon } from "./menu.svg";
import { ReactComponent as DotIcon } from "./dot.svg";
import { TopBarProps } from "./types";
import { WalletState } from "app/store/wallet/types";
import LensIcon from '@material-ui/icons/Lens';
import { truncate } from "app/utils";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: "100%",
  },
  toolBar: {
    paddingLeft: 0,
    [theme.breakpoints.up("sm")]: {
      "&>div": {
        flex: 1,
        flexBasis: 1,
        display: "flex",
        flexDirection: "row",
      },
    },
    [theme.breakpoints.down("xs")]: {
      paddingRight: 0,
    },
  },
  btnConnect: {

  },
  themeSwitch: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  grow: {
    flexGrow: 1,
  },
  dot: {
    marginRight: theme.spacing(1)
  },
  chipText: {
    color: theme.palette.text.primary
  }
}));

const TopBar: React.FC<TopBarProps & React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, onToggleDrawer, ...rest } = props;

  const classes = useStyles();
  const dispatch = useDispatch();
  const { wallet } = useSelector<RootState, WalletState>(state => state.wallet);
  const themeType = useSelector<RootState, string>(state => state.preference.theme);
  let address = "";

  const onConnectWallet = () => {
    dispatch(actions.Layout.toggleShowWallet());
  };

  if (wallet && wallet.account) {
    address = wallet.account.address
  }

  return (
    <AppBar {...rest} elevation={0} position="static" className={cls(classes.root, className)}>
      <Toolbar className={classes.toolBar} variant="dense">
        <Box justifyContent="flex-start">
          <IconButton onClick={onToggleDrawer}>
            <MenuIcon />
          </IconButton>
        </Box>
        <Box justifyContent="center">
          <Brand theme={themeType} />
        </Box>
        <Box display="flex" flex={1} justifyContent="flex-end" alignItems="center">
          {!wallet && (<Button className={classes.btnConnect} onClick={onConnectWallet}>Connect Wallet</Button>)}
          {wallet && (<Chip onClick={onConnectWallet} color="primary" size="small" variant="outlined" label={<Typography variant="button" color="textPrimary"><DotIcon className={classes.dot} />{truncate(address)}</Typography>} />)}
          < ThemeSwitch className={classes.themeSwitch} />
        </Box>
      </Toolbar>
    </AppBar >
  );
};

export default TopBar;