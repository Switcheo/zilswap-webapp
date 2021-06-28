import { Box, BoxProps, ButtonBase, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ContrastBox from "app/components/ContrastBox";
import CurrencyLogo from "app/components/CurrencyLogo";
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { AppTheme} from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";

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
}));

const CurrencyList: React.FC<CurrencyListProps> = (props) => {
  const { children, className, onSelectCurrency, onToggleUserToken, userTokens, emptyStateLabel, showContribution, search, tokens, ...rest } = props;
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 12 });

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

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {!!tokenState.initialized && search.length > 0 && !tokens.length && (
        <Typography color="error">
          {emptyStateLabel || `No tokens found for "${search}"`}
        </Typography>
      )}
      {tokens.map((token, index) => (
        <ButtonBase
          className={classes.buttonBase}
          key={index}
          focusRipple
          onClick={() => onSelect(token)}>
          <ContrastBox className={classes.currencyBox}>
            <CurrencyLogo className={classes.currencyLogo} currency={token.registered && token.symbol} address={token.address} />
            <Box display="flex" flexDirection="column">
              <Typography variant="h3">{token.symbol}</Typography>

              <Box display="flex" flexDirection="row">
                {!!token.name && (
                  <Typography color="textSecondary" variant="body2">{token.name}</Typography>
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
                <Typography align="right" variant="h6" component="p">
                  {moneyFormat(getTokenBalance(token), {
                    symbol: token.symbol,
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
