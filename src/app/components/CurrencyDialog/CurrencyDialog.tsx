import { Box, ButtonBase, DialogContent, DialogProps, InputAdornment, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { DialogModal } from "app/components";
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ZERO, sortTokens } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ContrastBox from "../ContrastBox";
import CurrencyLogo from "../CurrencyLogo";
import { ReactComponent as SearchIcon } from "./SearchIcon.svg";

export interface CurrencyDialogProps extends DialogProps {
  onSelectCurrency: (token: TokenInfo) => void;
};

const useStyles = makeStyles(theme => ({
  root: {
  },
  content: {
    width: 516,
    [theme.breakpoints.down("xs")]: {
      width: 296,
    },
  },
  input: {
    marginBottom: 20,
  },
  inputProps: {
    [theme.breakpoints.down("xs")]: {
      '&::placeholder': {
        fontSize: "10.5px"
      }
    }
  },
  currencyBox: {
    padding: "8px 12px 10px 12px",
    marginTop: "0px !important",
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  currencyLogo: {
    marginRight: 10
  },
  currencies: {
    maxHeight: 460,
    overflowY: "scroll",
    "-ms-overflow-style": "none",
    "&::-webkit-scrollbar": {
      // display: "none"
    },
    [theme.breakpoints.down("xs")]: {
      maxHeight: 324,
    }
  },
  buttonBase: {
    width: "100%",
    marginTop: "2px",
    textAlign: "left",
  },
}));

const CurrencyDialog: React.FC<CurrencyDialogProps> = (props: CurrencyDialogProps) => {
  const { children, className, onSelectCurrency, ...rest } = props;
  const classes = useStyles();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [search, setSearch] = useState("");
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 12 });

  const getTokenBalance = (token: TokenInfo): BigNumber => {
    if (!walletState.wallet) return BIG_ZERO;

    const wallet: ConnectedWallet = walletState.wallet!;
    const tokenBalance = token.balances && token.balances[wallet.addressInfo.byte20.toLowerCase()];
    if (!tokenBalance) return BIG_ZERO;

    return new BigNumber(tokenBalance.toString());
  };

  useEffect(() => {
    if (!tokenState.tokens) return setTokens([]);
    const tokens = [];
    for (const address in tokenState.tokens!) {
      const token = tokenState.tokens![address];
      tokens.push(token);
    }

    setTokens(tokens.sort(sortTokens));
  }, [tokenState.tokens]);

  const filterSearch = (token: TokenInfo): boolean => {
    if (!search.trim().length) return true;
    const searchTerm = search.toLowerCase();
    return token.address.toLowerCase().includes(searchTerm) ||
      token.name.toLowerCase().includes(searchTerm) ||
      token.symbol.toLowerCase().includes(searchTerm);
  };

  const filteredTokens = tokens.filter(filterSearch);
  return (
    <DialogModal header="Select a Token" {...rest} className={cls(classes.root, className)}>
      <DialogContent className={classes.content}>
        <OutlinedInput
          placeholder="Search token name, symbol or address"
          value={search}
          fullWidth
          className={classes.input}
          onChange={(e) => setSearch(e.target.value)}
          inputProps={{ className: classes.inputProps }}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
        {!tokenState.initialized && (
          <Box>
            <Typography color="error">Connect wallet to view tokens</Typography>
          </Box>
        )}

        <Box className={classes.currencies}>
          {!!tokenState.initialized && search.length > 0 && !filteredTokens.length && (
            <Box>
              <Typography color="error">No tokens found for "{search}"</Typography>
            </Box>
          )}
          {filteredTokens.map((token, index) => (
            <ButtonBase
              className={classes.buttonBase}
              key={index}
              focusRipple
              onClick={() => onSelectCurrency(token)}>
              <ContrastBox className={classes.currencyBox}>
                <CurrencyLogo className={classes.currencyLogo} currency={token.symbol} />
                <Box display="flex" flexDirection="column">
                  <Typography variant="h2">{token.symbol}</Typography>
                  <Typography color="textSecondary" variant="body2">{token.name}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography align="right" variant="h6" component="p">
                    {moneyFormat(getTokenBalance(token), {
                      symbol: token.symbol,
                      compression: token.decimals,
                      showCurrency: true,
                    })}
                  </Typography>
                </Box>
              </ContrastBox>
            </ButtonBase>
          ))}
        </Box>
      </DialogContent>
    </DialogModal>
  )
}

export default CurrencyDialog;