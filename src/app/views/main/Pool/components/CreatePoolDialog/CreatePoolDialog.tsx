import { DialogContent, makeStyles, Typography } from "@material-ui/core";
import { DialogModal, FancyButton } from "app/components";
import { RootState, WalletState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ZilswapConnector } from "core/zilswap";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { AddressInput } from "./components";
import { TokenPreview } from "./components/AddressInput/AddressInput";

const useStyles = makeStyles(theme => ({
  root: {
  },
  content: {
    display: "flex",
    flexDirection: "column",
    width: 516,
    [theme.breakpoints.down("xs")]: {
      width: 296
    }
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
  const { children, className, open, onCloseDialog, onSelect, ...rest } = props;
  const classes = useStyles();
  const [tokenPreview, setTokenPreview] = useState<TokenPreview | undefined>();
  const [runAsyncTask, loading, error] = useAsyncTask("createPool");
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  const onCreatePool = () => {
    if (loading) return;

    runAsyncTask(async () => {
      if (!walletState.wallet)
        throw new Error("Connect wallet to create pool");
      if (!tokenPreview) throw new Error("Address not valid");
      const { address } = tokenPreview;
      const pool = ZilswapConnector.getPool(address);
      if (pool)
        throw new Error(`Pool for ${tokenPreview.symbol} already exists`);

      // TODO: create pool
      ZilswapConnector.addLiquidity({ 
        tokenID: address, 
        tokenAmount: new BigNumber(0),
        zilAmount: new BigNumber(0),
      });
    });
  };

  return (
    <DialogModal header="Create Pool" open={open} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      <DialogContent className={classes.content}>
        <AddressInput onTokenChanged={preview => setTokenPreview(preview)} />
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