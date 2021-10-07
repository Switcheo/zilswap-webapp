import { Box, Hidden, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { NavDrawer, ArkTopBar } from "app/components";
import ConnectWalletButton from "app/components/ConnectWalletButton";
import { AppTheme } from "app/theme/types";
import React, { Suspense, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { renderRoutes } from "react-router-config";
import TransactionDialog from "../TransactionDialog";
import WalletDialog from "../WalletDialog";
import { DevInfoBadge } from "../MainLayout/components";
import { actions } from "app/store";
import { BlockchainState, MarketPlaceState, RootState, WalletState } from "app/store/types";
import dayjs from "dayjs";

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
}));

const ArkLayout: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { route } = props;
  const classes = useStyles();
  const [showDrawer, setShowDrawer] = useState(false);
  const blockchainState = useSelector<RootState, BlockchainState>((state) => state.blockchain);
  const walletState = useSelector<RootState, WalletState>((state) => state.wallet);
  const marketplaceState = useSelector<RootState, MarketPlaceState>((state) => state.marketplace);
  const dispatch = useDispatch();

  useEffect(() => {
    if (blockchainState.ready && walletState.wallet?.addressInfo.bech32) {
      const { oAuth } = marketplaceState;
      if (oAuth && dayjs(oAuth.expires_at * 1000).isBefore(dayjs())) {
        dispatch(actions.MarketPlace.initialize());
      } else if (!oAuth) {
        dispatch(actions.MarketPlace.initialize());
      } else {
      }
    }
    // eslint-disable-next-line
  }, [blockchainState.ready, walletState.wallet?.addressInfo.bech32]);

  const onToggleDrawer = (override?: boolean) => {
    setShowDrawer(typeof override === "boolean" ? override : !showDrawer);
  };

  // to change according to new ARK layout
  return (
    <Box className={classes.root}>
      <ArkTopBar onToggleDrawer={onToggleDrawer} />
      <main className={classes.content}>
        <DevInfoBadge />
        <Suspense fallback={<LinearProgress />}>
          {renderRoutes(route.routes)}
        </Suspense>
      </main>
      <Hidden smUp>
        <ConnectWalletButton />
      </Hidden>
      <WalletDialog />
      <TransactionDialog />
      <NavDrawer open={showDrawer} onClose={() => onToggleDrawer(false)} />
    </Box>
  );
};

export default ArkLayout;
