import { DialogContent, makeStyles } from "@material-ui/core";
import { DialogModal, FancyButton } from "app/components";
import { RootState, WalletState } from "app/store/types";
import cls from "classnames";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { AddressInput } from "./components";
import { TokenPreview } from "./components/AddressInput/AddressInput";
import { useAsyncTask } from "app/utils";

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
}));

const CreatePoolDialog = (props: any) => {
  const { children, className, open, onCloseDialog, onSelect, ...rest } = props;
  const classes = useStyles();
  const [tokenPreview, setTokenPreview] = useState<TokenPreview | undefined>();
  const [runAsyncTask, loading, error] = useAsyncTask("createPool");
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  const onCreatePool = () => {

  };

  return (
    <DialogModal header="Create Pool" open={open} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      <DialogContent className={classes.content}>
        <AddressInput onTokenChanged={preview => setTokenPreview(preview)} />
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