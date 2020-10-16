import { Box, BoxProps, InputLabel, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { KeyValueDisplay, LoadableArea } from "app/components";
import { RootState, TokenBalanceMap, WalletState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import { PlaceholderStrings } from "app/utils/contants";
import cls from "classnames";
import { zilParamsToMap } from "core/utilities";
import { BN, Contract, getBalancesMap, toBech32Address, ZilliqaValidate, ZilswapConnector } from "core/zilswap";
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
  placeholder: string;
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
  inputText: {
    fontSize: '16px!important',
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px!important"
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
  const { children, className, placeholder, onTokenChanged, ...rest } = props;
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

        const token = await ZilswapConnector.addPoolToken({ address: inputAddress });
        const contract = token.contract

        const contractInit = zilParamsToMap(contract.init);

        const contractBalanceState = await getBalancesMap(token.contract);

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
        placeholder={placeholder || PlaceholderStrings.ZilAddress}
        value={address}
        fullWidth
        className={cls(classes.input, error ? classes.inputError : {})}
        onChange={(e) => setAddress(e.target.value)}
        classes={{ input: classes.inputText }}
      />
      <Box className={classes.preview}>
        <LoadableArea loading={loading}>
          {!!tokenPreview && (
            <>
              <KeyValueDisplay kkey={"Name"} mb="8px">{tokenPreview.name}</KeyValueDisplay>
              <KeyValueDisplay kkey={"Symbol"} mb="8px">{tokenPreview.symbol}</KeyValueDisplay>
              <KeyValueDisplay kkey={"Decimals"} mb="8px">{tokenPreview.decimals}</KeyValueDisplay>
            </>
          )}
        </LoadableArea>
      </Box>
    </Box>
  );
};

export default AddressInput;
