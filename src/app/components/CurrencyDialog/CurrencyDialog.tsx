import { Box, Button, CircularProgress, DialogContent, DialogProps, InputAdornment, makeStyles, OutlinedInput, Typography } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import ArrayOpenedIcon from "@material-ui/icons/ArrowDropDown";
import ArrayClosedIcon from "@material-ui/icons/ArrowRight";
import { DialogModal } from "app/components";
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { useTaskSubscriber } from "app/utils";
import { BIG_ZERO, LoadingKeys, sortTokens } from "app/utils/constants";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CurrencyList } from "./components";

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
    maxHeight: 460,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  currenciesHeader: {
    justifyContent: "left",
    borderRadius: 0,
    margin: theme.spacing(1, 0, .5),
  },
  currencies: {
    maxHeight: "1000000px",
  },
  currenciesHidden: {
    maxHeight: "0px",
    overflow: "hidden",
  },
}));

export interface CurrencyDialogProps extends DialogProps {
  onSelectCurrency: (token: TokenInfo) => void;
  hideZil?: boolean;
  hideNoPool?: boolean;
  showContribution?: boolean;
};

type FormState = {
  showRegistered: boolean;
  showOthers: boolean;
};

const initialFormState: FormState = {
  showRegistered: true,
  showOthers: true,
};

const CurrencyDialog: React.FC<CurrencyDialogProps> = (props: CurrencyDialogProps) => {
  const { children, className, onSelectCurrency, hideZil, hideNoPool, showContribution, ...rest } = props;
  const classes = useStyles();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<FormState>({ ...initialFormState });
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const [loadingConnectWallet] = useTaskSubscriber(...LoadingKeys.connectWallet);

  useEffect(() => {
    if (!tokenState.tokens) return setTokens([]);
    const tokens = [];
    for (const address in tokenState.tokens!) {
      const token = tokenState.tokens![address];
      tokens.push(token);
    }

    setTokens(tokens.sort(sortTokens));
  }, [tokenState.tokens]);

  const onToggleFormState = (key: keyof FormState) => {
    setFormState({
      ...formState,
      [key]: !formState[key],
    })
  };

  const filterSearch = (token: TokenInfo, registered?: boolean): boolean => {
    const searchTerm = search.toLowerCase().trim();
    if (token.isZil && hideZil) return false;
    if (!token.isZil && !token.pool && hideNoPool) return false;
    if (!searchTerm.length && registered === undefined) return true;

    if (registered && !token.registered) return false;
    if (!registered && token.registered) return false;

    return token.address.toLowerCase() === searchTerm ||
      (typeof token.name === "string" && token.name?.toLowerCase().includes(searchTerm)) ||
      token.symbol.toLowerCase().includes(searchTerm);
  };

  const getTokenFilter = (type: "registered" | "unverified") => {
    return (token: TokenInfo) => filterSearch(token, type === "registered")
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
    const difference = new BigNumber(rhs.balances?.[userAddress]?.toString() || 0).comparedTo(lhs.balances?.[userAddress]?.toString() || 0);
    return difference !== 0 ? difference : lhs.symbol.localeCompare(rhs.symbol);
  };

  const verifiedTokens = tokens.filter(getTokenFilter("registered")).sort(sortResult);
  const unverifiedTokens = tokens.filter(getTokenFilter("unverified")).sort(sortResult);
  return (
    <DialogModal header="Select a Token" {...rest} className={clsx(classes.root, className)}>
      <DialogContent>
        {!loadingConnectWallet && (
          <OutlinedInput
            placeholder="Search token name, symbol or address"
            value={search}
            fullWidth
            classes={{ input: classes.inputText }}
            className={classes.input}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchOutlined color="primary" />
              </InputAdornment>
            }
          />
        )}
        {!loadingConnectWallet && !tokenState.initialized && (
          <Box>
            <Typography color="error">Connect wallet to view tokens</Typography>
          </Box>
        )}

        {loadingConnectWallet && (
          <Box display="flex" justifyContent="center">
            <CircularProgress color="primary" />
          </Box>
        )}

        {tokenState.initialized && (
          <Box className={classes.currenciesContainer}>
            <Button color="inherit" component="h3" variant="text"
              className={classes.currenciesHeader}
              onClick={() => onToggleFormState("showRegistered")}>
              Registered tokens
              {formState.showRegistered ? <ArrayOpenedIcon /> : <ArrayClosedIcon />}
            </Button>
            <CurrencyList
              tokens={verifiedTokens}
              search={search}
              emptyStateLabel={`No verified tokens found for "${search}"`}
              showContribution={showContribution}
              onSelectCurrency={onSelectCurrency}
              className={clsx(classes.currencies, { [classes.currenciesHidden]: !formState.showRegistered })} />

            <Button color="inherit" component="h3" variant="text"
              className={classes.currenciesHeader}
              onClick={() => onToggleFormState("showOthers")}>
              Others
              {formState.showOthers ? <ArrayOpenedIcon /> : <ArrayClosedIcon />}
            </Button>
            <CurrencyList
              tokens={unverifiedTokens}
              search={search}
              emptyStateLabel={`No other tokens found for "${search}"`}
              showContribution={showContribution}
              onSelectCurrency={onSelectCurrency}
              className={clsx(classes.currencies, { [classes.currenciesHidden]: !formState.showOthers })} />
          </Box>
        )}
      </DialogContent>
    </DialogModal>
  )
}

export default CurrencyDialog;
