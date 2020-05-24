import { Box, DialogContent, InputLabel, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { DialogModal, FancyButton, KeyValueDisplay, LoadableArea } from "app/components";
import { RootState, WalletState } from "app/store/types";
import { useAsyncTask, truncate } from "app/utils";
import cls from "classnames";
import { zilParamsToMap } from "core/utilities";
import { ZilliqaValidate, toBech32Address, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

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
  input: {
    marginBottom: 20,
  },
  inputError: {
    border: `1px solid ${theme.palette.error.main}`
  },
  inputProps: {
    [theme.breakpoints.down("xs")]: {
      '&::placeholder': {
        fontSize: "11px"
      }
    }
  },
  preview: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6),
  },
  actionButton: {
    height: 46,
    marginBottom: theme.spacing(6),
  },
  error: {
    float: "right",
  },
  floatLeft: {
    float: "left",
  },
}));

type TokenPreview = {
  name: string;
  symbol: string;
  decimals: number;
};

const CreatePoolDialog = (props: any) => {
  const { children, className, open, onCloseDialog, onSelect, ...rest } = props;
  const classes = useStyles();
  const [address, setAddress] = useState<string>("");
  const [tokenPreview, setTokenPreview] = useState<TokenPreview | undefined>();
  const [runQueryTokenAddress, loadingQueryTokenAddress, errorQueryTokenAddress] = useAsyncTask("createPoolQueryTokenAddress");
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const [error] = useState("");

  useEffect(() => {
    if (loadingQueryTokenAddress) return;
    let inputAddress = address;
    if (ZilliqaValidate.isAddress(inputAddress))
      inputAddress = toBech32Address(inputAddress);

    if (ZilliqaValidate.isBech32(inputAddress)) {

      runQueryTokenAddress(async () => {
        if (!walletState.wallet) 
          throw new Error("Connect wallet to view token information");

        const zilliqa = ZilswapConnector.getZilliqa();
        const contract = zilliqa.contracts.at(inputAddress);

        const contractInitParams = await contract.getInit();
        if (!contractInitParams)
          throw new Error(`${truncate(address)} is not a contract address`);
        const contractInit = zilParamsToMap(contractInitParams);

        setTokenPreview({
          name: contractInit.name,
          symbol: contractInit.symbol,
          decimals: parseInt(contractInit.decimals),
        });

      });
    } else {
      setTokenPreview(undefined);
    }
  }, [walletState.wallet, address]);

  const onCreatePool = () => {

  };

  return (
    <DialogModal header="Create Pool" open={open} onClose={onCloseDialog} {...rest} className={cls(classes.root, className)}>
      <DialogContent className={classes.content}>
        <InputLabel className={classes.floatLeft}>Token Address</InputLabel>
        {errorQueryTokenAddress && (
          <InputLabel className={classes.error}><Typography color="error">{errorQueryTokenAddress.message}</Typography></InputLabel>
        )}
        <OutlinedInput
          placeholder="Token Address"
          value={address}
          fullWidth
          className={cls(classes.input, error ? classes.inputError : {})}
          onChange={(e) => setAddress(e.target.value)}
          inputProps={{ className: classes.inputProps }}
        />
        <Box className={classes.preview}>
          <LoadableArea loading={loadingQueryTokenAddress}>
            {!!tokenPreview && (
              <>
                <KeyValueDisplay kkey={"Name"} value={tokenPreview.name} mb="8px" />
                <KeyValueDisplay kkey={"Symbol"} value={tokenPreview.symbol} mb="8px" />
                <KeyValueDisplay kkey={"Decimals"} value={`${tokenPreview.decimals}`} mb="8px" />
              </>
            )}
          </LoadableArea>
        </Box>
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