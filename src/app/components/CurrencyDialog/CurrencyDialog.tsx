import { Box, DialogContent, DialogProps, InputAdornment, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { DialogModal } from "app/components";
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { BIG_ZERO, sortTokens } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CurrencyList } from "./components";
import { ReactComponent as SearchIcon } from "./SearchIcon.svg";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 650,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 520,
    },
    [theme.breakpoints.down("xs")]: {
      maxWidth: 380,
    },
    "& .MuiPaper-root": {
      width: "100%",
    },
  },
  input: {
    marginBottom: 20,
  },
  inputText: {
    fontSize: '16px!important',
    [theme.breakpoints.down("xs")]: {
      fontSize: "12px!important"
    }
  },
  currenciesContainer: {
    height: 460,
    display: "flex",
    flexDirection: "column",
  },
  currenciesHeader: {
    margin: theme.spacing(1, 0, .5),
  },
  currencies: {
    flex: 1,
    flexBasis: "50%",
    overflowY: "auto",
    "-ms-overflow-style": "none",
    "&::-webkit-scrollbar": {
      // display: "none"
    },
    [theme.breakpoints.down("xs")]: {
      maxHeight: 324,
    }
  },
}));

export interface CurrencyDialogProps extends DialogProps {
  onSelectCurrency: (token: TokenInfo) => void;
  hideZil?: boolean;
  hideNoPool?: boolean;
  showContribution?: boolean;
};

const CurrencyDialog: React.FC<CurrencyDialogProps> = (props: CurrencyDialogProps) => {
  const { children, className, onSelectCurrency, hideZil, hideNoPool, showContribution, ...rest } = props;
  const classes = useStyles();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [search, setSearch] = useState("");
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);

  useEffect(() => {
    if (!tokenState.tokens) return setTokens([]);
    const tokens = [];
    for (const address in tokenState.tokens!) {
      const token = tokenState.tokens![address];
      tokens.push(token);
    }

    setTokens(tokens.sort(sortTokens));
  }, [tokenState.tokens]);

  const filterSearch = (token: TokenInfo, whitelisted?: boolean): boolean => {
    const searchTerm = search.toLowerCase().trim();
    if (token.isZil && hideZil) return false;
    if (!token.isZil && !token.pool && hideNoPool) return false;
    if (!searchTerm.length && whitelisted === undefined) return true;

    if (whitelisted && !token.whitelisted) return false;
    if (!whitelisted && token.whitelisted) return false;

    return token.address.toLowerCase() === searchTerm ||
      token.name.toLowerCase().includes(searchTerm) ||
      token.symbol.toLowerCase().includes(searchTerm);
  };

  const getTokenFilter = (type: "whitelisted" | "unverified") => {
    return (token: TokenInfo) => filterSearch(token, type === "whitelisted")
  };

  const sortResult = (lhs: TokenInfo, rhs: TokenInfo) => {
    if (!walletState.wallet) return 0;
    if (lhs.isZil) return -1;
    if (rhs.isZil) return 1;
    if (showContribution) {
      // sort first by contribution
      const difference = (rhs.pool?.userContribution || BIG_ZERO)
        .comparedTo(lhs.pool?.userContribution || BIG_ZERO);
      // then lexicographically by symbol
      return difference !== 0 ? difference : lhs.symbol.localeCompare(rhs.symbol);
    }
    const userAddress = walletState.wallet!.addressInfo.byte20.toLowerCase();
    const difference = new BigNumber(rhs.balances[userAddress]?.toString() || 0).comparedTo(lhs.balances[userAddress]?.toString() || 0);
    return difference !== 0 ? difference : lhs.symbol.localeCompare(rhs.symbol);
  };

  const verifiedTokens = tokens.filter(getTokenFilter("whitelisted")).sort(sortResult);
  const unverifiedTokens = tokens.filter(getTokenFilter("unverified")).sort(sortResult);
  return (
    <DialogModal header="Select a Token" {...rest} className={cls(classes.root, className)}>
      <DialogContent>
        <OutlinedInput
          placeholder="Search token name, symbol or address"
          value={search}
          fullWidth
          classes={{
            input: classes.inputText
          }}
          className={classes.input}
          onChange={(e) => setSearch(e.target.value)}
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

        {tokenState.initialized && (
          <Box className={classes.currenciesContainer}>
            <Typography className={classes.currenciesHeader} variant="h3">Verified tokens</Typography>
            <CurrencyList
              tokens={verifiedTokens}
              search={search}
              emptyStateLabel={`No verified tokens found for "${search}"`}
              showContribution={showContribution}
              onSelectCurrency={onSelectCurrency}
              className={classes.currencies} />

            <Typography className={classes.currenciesHeader} variant="h3">Others</Typography>
            <CurrencyList
              tokens={unverifiedTokens}
              search={search}
              emptyStateLabel={`No other tokens found for "${search}"`}
              showContribution={showContribution}
              onSelectCurrency={onSelectCurrency}
              className={classes.currencies} />
          </Box>
        )}
      </DialogContent>
    </DialogModal>
  )
}

export default CurrencyDialog;
