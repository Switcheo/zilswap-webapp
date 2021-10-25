import React, { useState } from "react";
import { DialogContent, Typography, makeStyles } from "@material-ui/core";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import { ZilswapConnector } from "core/zilswap";
import { DialogModal, FancyButton } from "app/components";
import { actions } from "app/store";
import { RootState, TokenInfo, WalletState } from "app/store/types";
import { useAsyncTask, useNetwork } from "app/utils";
import { BIG_ZERO, PlaceholderStrings } from "app/utils/constants";
import { AppTheme } from "app/theme/types";
import { AddressInput } from "./components";
import { TokenPreview } from "./components/AddressInput/AddressInput";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  content: {
    display: "flex",
    flexDirection: "column",
    width: 516,
    [theme.breakpoints.down("xs")]: {
      width: "fit-content",
    },
    backgroundColor: theme.palette.background!.default,
    borderLeft: theme.palette.border,
    borderRight: theme.palette.border,
    borderBottom: theme.palette.border,
    borderRadius: "0 0 12px 12px"
  },
  actionButton: {
    height: 46,
    marginBottom: theme.spacing(6),
  },
  error: {
    marginBottom: theme.spacing(2),
  },
}));

const CreatePoolDialog = (props: any) => {
  const { children, className, open, onCloseDialog, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const network = useNetwork();
  const [tokenPreview, setTokenPreview] = useState<TokenPreview | undefined>();
  const [runAsyncTask, loading, error] = useAsyncTask("createPool");
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  const onCreatePool = () => {
    if (loading) return;

    runAsyncTask(async () => {
      const zilswapSdk = ZilswapConnector.getSDK();
      if (!zilswapSdk)
        throw new Error("zilswap not initialized");
      if (!walletState.wallet)
        throw new Error("Connect wallet to create pool");
      if (!tokenPreview) throw new Error("Address not valid");
      const { address } = tokenPreview;
      if (zilswapSdk.getAppState().tokens[address])
        throw new Error(`Pool for ${tokenPreview.symbol} already exists`);

      const token: TokenInfo = {
        address,
        initialized: false,
        whitelisted: false,
        isWzil: false,
        isZil: false,
        isZwap: false,
        registered: false,
        symbol: tokenPreview.symbol,
        name: tokenPreview.name,
        decimals: tokenPreview.decimals,
        balance: BIG_ZERO,
        allowances: {},
        blockchain: Blockchain.Zilliqa,
      };

      dispatch(actions.Token.add({ token }));
      dispatch(actions.Pool.select({ token, network }));
      dispatch(actions.Layout.showPoolType("add"));
      setTimeout(() => { dispatch(actions.Token.refetchState()) })

      return onCloseDialog();
    });
  };

  return (
    <DialogModal header="Create Pool" open={open} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      <DialogContent className={classes.content}>
        <AddressInput placeholder={PlaceholderStrings.ZilTokenAddress} onTokenChanged={preview => setTokenPreview(preview)} />
        {error && (
          <Typography className={classes.error} color="error">{error.message}</Typography>
        )}
        <FancyButton walletRequired fullWidth
          disabled={!tokenPreview}
          className={classes.actionButton}
          variant="contained"
          color="primary"
          onClick={onCreatePool}>
          Create Pool
        </FancyButton>
      </DialogContent>
    </DialogModal>
  )
}

export default CreatePoolDialog;
