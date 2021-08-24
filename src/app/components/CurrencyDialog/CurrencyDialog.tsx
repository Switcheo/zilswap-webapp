
import { Box, CircularProgress, DialogContent, DialogProps, makeStyles, OutlinedInput, InputAdornment, IconButton } from "@material-ui/core";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import { DialogModal } from "app/components";
import { BridgeState } from "app/store/bridge/types";
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { hexToRGBA, useTaskSubscriber } from "app/utils";
import { BIG_ZERO, LoadingKeys } from "app/utils/constants";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Blockchain } from "tradehub-api-js";
import { CurrencyList } from "./components";
import { actions } from "app/store";
import CloseIcon from "@material-ui/icons/CloseOutlined";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 650,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 520,
    },
    [theme.breakpoints.down("xs")]: {
      maxWidth: '100%',
      padding: '16px',
    },
    "& .MuiPaper-root": {
      width: "100%",
    },
    "& .MuiDialogTitle-root": {
      backgroundColor: theme.palette.type === "dark" ? "#12222C" : "#F6FFFC"
    },
  },
  input: {
    backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#D4FFF2",
    marginBottom: 20,
    borderColor: theme.palette.type === "dark" ? "#29475A" : "#D4FFF2",
    '&.Mui-focused': {
      borderColor: theme.palette.primary.dark,
    },
  },
  inputText: {
    fontSize: '16px!important',
    [theme.breakpoints.down("xs")]: {
      fontSize: "16px!important"
    },
    padding: "18.5px 14px!important",
  },
  currenciesContainer: {
    maxHeight: 460,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    '&::-webkit-scrollbar': {
      width: '0.4rem'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: `rgba${hexToRGBA(theme.palette.text.primary, 0.1)}`,
      borderRadius: 12
    }
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
  dialogContent: {
    backgroundColor: theme.palette.type === "dark" ? "#12222C" : "#F6FFFC",
    borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
    borderRadius: "0 0 12px 12px",
    paddingTop: '24px',
    [theme.breakpoints.down("sm")]: {
      paddingTop: '0px',
    },
  },
  closeIcon: {
    color: theme.palette.primary.main,
  },
}));

export type CurrencyListType = "zil" | "bridge-zil" | "bridge-eth";

export interface CurrencyDialogProps extends DialogProps {
  onSelectCurrency: (token: TokenInfo) => void;
  hideZil?: boolean;
  hideNoPool?: boolean;
  showContribution?: boolean;
  tokenList: CurrencyListType;
};

const CurrencyDialog: React.FC<CurrencyDialogProps> = (props: CurrencyDialogProps) => {
  const { className, onSelectCurrency, hideZil, hideNoPool, showContribution, tokenList, open, onClose } = props;
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loadingConnectWallet] = useTaskSubscriber(...LoadingKeys.connectWallet);
  const dispatch = useDispatch();

  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);

  useEffect(() => {
    if (!tokenState.tokens) return setTokens([]);
    const sortFn = (lhs: TokenInfo, rhs: TokenInfo) => {
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
      const difference = new BigNumber(rhs.balance?.toString() || 0).comparedTo(lhs.balance?.toString() || 0);
      return difference !== 0 ? difference : lhs.symbol.localeCompare(rhs.symbol);
    };
    let tokens = Object.values(tokenState.tokens);
    if (tokenList === 'zil') {
      tokens = tokens.filter(t => t.blockchain === Blockchain.Zilliqa)
    } else if (tokenList === 'bridge-eth') {
      tokens = tokens.filter(t => t.blockchain === Blockchain.Ethereum)
    } else if (tokenList === 'bridge-zil') {
      tokens = tokens.filter(t => bridgeState.tokens[Blockchain.Zilliqa].findIndex(b => toBech32Address(b.tokenAddress) === t.address) >= 0)
    }
    setTokens(tokens.sort(sortFn));
  }, [tokenState.tokens, walletState.wallet, bridgeState.tokens, showContribution, tokenList]);

  const filterSearch = (token: TokenInfo): boolean => {
    const searchTerm = search.toLowerCase().trim();
    if (token.isZil && hideZil) return false;
    if (!token.isZil && !token.pool && hideNoPool) return false;
    if (searchTerm === "" && !token.registered && !tokenState.userSavedTokens.includes(token.address)) return false;

    if (!token.registered && !tokenState.userSavedTokens.includes(token.address)) {
      return token.address.toLowerCase() === searchTerm;
    }

    return token.address.toLowerCase() === searchTerm ||
      (typeof token.name === "string" && token.name?.toLowerCase().includes(searchTerm)) ||
      token.symbol.toLowerCase().includes(searchTerm);
  };

  const onToggleUserToken = (token: TokenInfo) => {
    if (!tokenState.userSavedTokens.includes(token.address)) setSearch("");
    dispatch(actions.Token.updateUserSavedTokens(token.address))
  };

  const filteredTokens = tokens.filter(filterSearch);

  return (
    <DialogModal header="Select Token" open={open} onClose={onClose} className={clsx(classes.root, className)}>
      <DialogContent className={classes.dialogContent}>
        {!loadingConnectWallet && (
          <OutlinedInput
            placeholder="Search name or enter address"
            value={search}
            fullWidth
            classes={{ input: classes.inputText }}
            className={classes.input}
            onChange={(e) => setSearch(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <CloseIcon className={classes.closeIcon} />
                </IconButton>
              </InputAdornment>
            }
          />
        )}
        {(loadingConnectWallet || !tokenState.initialized) && (
          <Box display="flex" justifyContent="center">
            <CircularProgress color="primary" />
          </Box>
        )}

        <Box className={classes.currenciesContainer}>
          <CurrencyList
            tokens={filteredTokens}
            search={search}
            emptyStateLabel="No token found."
            showContribution={showContribution}
            userTokens={tokenState.userSavedTokens}
            onToggleUserToken={onToggleUserToken}
            onSelectCurrency={onSelectCurrency}
            className={clsx(classes.currencies)} />
        </Box>
      </DialogContent>
    </DialogModal>
  )
}

export default CurrencyDialog;
