import { Box, BoxProps, InputLabel, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { KeyValueDisplay, LoadableArea } from "app/components";
import { RootState, WalletState, TokenBalanceMap } from "app/store/types";
import { truncate, useAsyncTask } from "app/utils";
import cls from "classnames";
import { zilParamsToMap } from "core/utilities";
import { toBech32Address, ZilliqaValidate, ZilswapConnector, Contract, BN, getBalancesMap } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export type TokenPreview = {
  contract: Contract;
  init_supply: BN;
  balances: TokenBalanceMap;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
};

export interface AddressInputProps extends BoxProps {
  onTokenChanged: (tokenPreview?: TokenPreview) => void;
};

const useStyles = makeStyles(theme => ({
  root: {
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
  error: {
    float: "right",
  },
  floatLeft: {
    float: "left",
  },
}));

const AddressInput: React.FC<AddressInputProps> = (props: AddressInputProps) => {
  const { children, className, onTokenChanged, ...rest } = props;
  const classes = useStyles();
  const [address, setAddress] = useState<string>("");
  const [tokenPreview, setTokenPreview] = useState<TokenPreview | undefined>();
  const [runAsyncTask, loading, error] = useAsyncTask("createPoolQueryTokenAddress");
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  useEffect(() => {
    if (typeof onTokenChanged === "function")
      onTokenChanged(tokenPreview);

    // eslint-disable-next-line
  }, [tokenPreview]);

  useEffect(() => {
    if (loading) return;
    let inputAddress = address;
    if (ZilliqaValidate.isAddress(inputAddress))
      inputAddress = toBech32Address(inputAddress);

    if (ZilliqaValidate.isBech32(inputAddress)) {

      runAsyncTask(async () => {
        if (!walletState.wallet)
          throw new Error("Connect wallet to view token information");

        const zilliqa = ZilswapConnector.getZilliqa();
        const contract = zilliqa.contracts.at(inputAddress);

        const contractInitParams = await contract.getInit();
        if (!contractInitParams)
          throw new Error(`${truncate(address)} is not a contract address`);
        const contractInit = zilParamsToMap(contractInitParams);

        const contractBalanceState = await getBalancesMap(contract);

        const balances: TokenBalanceMap = {};
        for (const address in contractBalanceState)
          balances[address] = new BN(contractBalanceState[address]);

        setTokenPreview({
          contract, balances,
          init_supply: contractInit.init_supply,
          name: contractInit.name,
          symbol: contractInit.symbol,
          address: inputAddress,
          decimals: parseInt(contractInit.decimals),
        });
      });
    } else {
      setTokenPreview(undefined);
    }
    // eslint-disable-next-line
  }, [walletState.wallet, address]);

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <InputLabel className={classes.floatLeft}>Token Address</InputLabel>
      {error && (
        <InputLabel className={classes.error}><Typography color="error">{error.message}</Typography></InputLabel>
      )}
      <OutlinedInput
        placeholder="zil18zlr57uhrmnk4mfkuawgv0un295k970a9s3lnq"
        value={address}
        fullWidth
        className={cls(classes.input, error ? classes.inputError : {})}
        onChange={(e) => setAddress(e.target.value)}
        inputProps={{ className: classes.inputProps }}
      />
      <Box className={classes.preview}>
        <LoadableArea loading={loading}>
          {!!tokenPreview && (
            <>
              <KeyValueDisplay kkey={"Name"} value={tokenPreview.name} mb="8px" />
              <KeyValueDisplay kkey={"Symbol"} value={tokenPreview.symbol} mb="8px" />
              <KeyValueDisplay kkey={"Decimals"} value={`${tokenPreview.decimals}`} mb="8px" />
            </>
          )}
        </LoadableArea>
      </Box>
    </Box>
  );
};

export default AddressInput;