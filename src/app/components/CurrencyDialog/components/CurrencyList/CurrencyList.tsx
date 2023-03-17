import React from "react";
import { Box, BoxProps, ButtonBase, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toBech32Address } from "@zilliqa-js/crypto";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { useSelector } from "react-redux";
import ContrastBox from "app/components/ContrastBox";
import CurrencyLogo from "app/components/CurrencyLogo";
import { BridgeState, RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { netZilToCarbon, useMoneyFormatter, useNetwork } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import { formatSymbol, formatTokenName } from "app/utils/currencies";
import { evmIncludes, getTokenDenomList } from 'app/utils/bridge'
import { swthTokenAddress } from 'app/views/main/Bridge/components/constants'

type CurrencyListProps = BoxProps & {
  tokens: TokenInfo[];
  search: string;
  showContribution?: boolean;
  emptyStateLabel?: string;
  onSelectCurrency: (token: TokenInfo) => void;
  onToggleUserToken: (token: TokenInfo) => void;
  userTokens: string[];
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  buttonBase: {
    width: "100%",
    marginTop: "2px",
    textAlign: "left",
  },
  currencyBox: {
    padding: "8px 12px 10px 12px",
    marginTop: "0px !important",
    display: "flex",
    alignItems: "center",
    width: "100%",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: theme.palette.currencyInput
    }
  },
  currencyLogo: {
    marginRight: 10
  },
  subtleText: {
    fontStyle: "italic",
    opacity: .5,
  },
  addRemoveFont: {
    fontSize: "10px",
    textDecoration: "underline",
  },
  tokenName: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    maxWidth: 125,
  },
}));

const CurrencyList: React.FC<CurrencyListProps> = (props) => {
  const { children, className, onSelectCurrency, onToggleUserToken, userTokens, emptyStateLabel, showContribution, search, tokens, ...rest } = props;
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const bridgeState = useSelector<RootState, BridgeState>(state => state.bridge);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 12 });
  const network = useNetwork();

  const getTokenBalance = (token: TokenInfo): BigNumber => {
    if (!walletState.wallet) return BIG_ZERO;
    if (showContribution) {
      const contribution = token.pool?.userContribution ?? BIG_ZERO;
      return contribution as BigNumber;
    } else {
      const amount = token.balance;
      if (!amount) return BIG_ZERO;

      return new BigNumber(amount.toString());
    }
  };
  const getContributionPercentage = (token: TokenInfo) => {
    if (!walletState.wallet) return BIG_ZERO;
    return (token.pool?.contributionPercentage ?? BIG_ZERO) as BigNumber;
  };

  const onSelect = (token: TokenInfo) => {
    onSelectCurrency(token)
  };

  const onAddRemove = (e: React.MouseEvent, token: TokenInfo) => {
    e.stopPropagation();

    onToggleUserToken(token);
  }

  const getLogoAddress = (token: TokenInfo) => {
    if (evmIncludes(token.blockchain)) {
      const tokenHash = token.address.replace(/^0x/i, "");
      const bridgeToken = bridgeState.tokens.find((bridgeToken) => bridgeToken.tokenAddress === tokenHash)
      const destToken = bridgeState.tokens.find((token) => token.denom === bridgeToken?.chains[bridgeState.formState.toBlockchain])

      if (bridgeToken) {
        if (destToken) return toBech32Address(destToken.tokenAddress);
        if (getTokenDenomList(netZilToCarbon(network))[token.blockchain] === bridgeToken.denom) { //If bridgeToken is a wrapped swth token
          return swthTokenAddress //SWTH token address
        }
      }
    }

    return token.address;
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {!!tokenState.initialized && search.length > 0 && !tokens.length && (
        <Typography color="error">
          {emptyStateLabel || `No token found for "${search}"`}
        </Typography>
      )}
      {tokens.map((token, index) => (
        <ButtonBase
          className={classes.buttonBase}
          key={index}
          focusRipple
          onClick={() => onSelect(token)}>
          <ContrastBox className={classes.currencyBox}>
            <CurrencyLogo className={classes.currencyLogo} currency={token.registered && token.symbol} address={getLogoAddress(token)} />
            <Box display="flex" flexDirection="column">
              <Typography variant="h3">{formatSymbol(token)}</Typography>

              <Box display="flex" flexDirection="row">
                {!!token.name && (
                  <Typography className={classes.tokenName} color="textSecondary" variant="body2">
                    {formatTokenName(token)}
                  </Typography>
                )}
                {!token.registered && (
                  <Typography className={classes.addRemoveFont} onClick={(e) => onAddRemove(e, token)}>
                    {userTokens.includes(token.address) ? "Remove" : "Add"}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box flex={1}>
              {!!walletState.wallet && (
                <Typography align="right" variant="h6" component="div">
                  {moneyFormat(getTokenBalance(token), {
                    symbol: formatSymbol(token),
                    maxFractionDigits: showContribution ? 5 : token.decimals,
                    compression: token.decimals,
                    showCurrency: true,
                  })}
                </Typography>
              )}
              {showContribution && (
                <Typography align="right" color="textSecondary" variant="body2">
                  {moneyFormat(getContributionPercentage(token), {
                    maxFractionDigits: 2,
                    compression: 0,
                    showCurrency: false,
                  })}%
                </Typography>
              )}
            </Box>
          </ContrastBox>
        </ButtonBase>
      ))}
    </Box>
  );
};

export default CurrencyList;
