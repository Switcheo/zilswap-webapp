import React, { Suspense, useEffect, useState } from "react";
import cls from "classnames";
import { Box, Hidden, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router-dom";
import { renderRoutes } from "react-router-config";
import { ArkNavDrawer, ArkTopBar, NavDrawer, ZilTokenSwapCTABanner } from "app/components";
import ConnectWalletButton from "app/components/ConnectWalletButton";
import { AppTheme } from "app/theme/types";
import { actions } from "app/store";
import { BlockchainState, RootState, WalletState } from "app/store/types";
import TransactionDialog from "../TransactionDialog";
import WalletDialog from "../WalletDialog";
import { DevInfoBadge } from "../MainLayout/components";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background:
      theme.palette.type === "dark"
        ? "radial-gradient(50% 50% at 50% 0%, #9CFFFF -800%, rgba(255, 156, 156, 0) 85%), radial-gradient(50% 50% at 50% 100%, #9CFFFF -800%, rgba(255, 156, 156, 0) 85%), #0D1B24"
        : "#F6FFFC",
  },
  content: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      display: "block",
    },
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(8),
    },
  },
  mintBackground: {
    background: theme.palette.type === "dark" ? "radial-gradient(50% 50% at 50% 0%, #00FFB0 -800%, rgba(0, 255, 176, 0) 85%), radial-gradient(50% 20% at 50% 100%, #9CFFFF -800%, rgba(255, 156, 156, 0) 85%), #0D1B24" : "#F6FFFC",
  }
}));

const ArkLayout: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { route } = props;
  const classes = useStyles();
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showArkDrawer, setShowArkDrawer] = useState<boolean>(false);
  const blockchainState = useSelector<RootState, BlockchainState>(
    (state) => state.blockchain
  );
  const walletState = useSelector<RootState, WalletState>(
    (state) => state.wallet
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (blockchainState.ready && walletState.wallet?.addressInfo.bech32) {
      dispatch(actions.MarketPlace.loadProfile());
    }
    // eslint-disable-next-line
  }, [blockchainState.ready, walletState.wallet?.addressInfo.bech32]);

  const isZilTokenSwap = useRouteMatch("/bridge/erc20-zil-swap");
  const isMint = useRouteMatch("/arky/mint");

  const onToggleDrawer = (override?: boolean) => {
    setShowDrawer(typeof override === "boolean" ? override : !showDrawer);
  };

  const onToggleArkDrawer = (override?: boolean) => {
    setShowArkDrawer(typeof override === "boolean" ? override : !showArkDrawer);
  };

  // to change according to new ARK layout
  return (
    <Box className={cls(classes.root, { [classes.mintBackground]: isMint })}>
      <ArkTopBar
        onToggleDrawer={onToggleDrawer}
        onToggleArkDrawer={onToggleArkDrawer}
      />
      <NavDrawer onClose={() => onToggleDrawer(false)} open={showDrawer} />
      <main className={classes.content}>
        <DevInfoBadge />
        {!isZilTokenSwap && <ZilTokenSwapCTABanner />}
        <Suspense fallback={<LinearProgress />}>
          {renderRoutes(route.routes)}
          <Box marginBottom={30} />
        </Suspense>
      </main>
      <Hidden smUp>
        <ConnectWalletButton />
      </Hidden>
      <WalletDialog />
      <TransactionDialog />
      <ArkNavDrawer
        open={showArkDrawer}
        onClose={() => onToggleArkDrawer(false)}
      />
    </Box>
  );
};

export default ArkLayout;
