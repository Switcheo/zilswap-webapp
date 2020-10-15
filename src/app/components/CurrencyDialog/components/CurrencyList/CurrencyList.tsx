import { Box, BoxProps, ButtonBase, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ContrastBox from "app/components/ContrastBox";
import CurrencyLogo from "app/components/CurrencyLogo";
import { RootState, TokenInfo, TokenState, WalletState } from "app/store/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ZERO } from "app/utils/contants";
import BigNumber from "bignumber.js";
import cls from "classnames";
import { ConnectedWallet } from "core/wallet";
import React from "react";
import { useSelector } from "react-redux";

type CurrencyListProps = BoxProps & {
  tokens: TokenInfo[];
  search: string;
  showContribution?: boolean;
  emptyStateLabel?: string;
  onSelectCurrency: (token: TokenInfo) => void;
};

const useStyles = makeStyles(theme => ({
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
    width: "100%"
  },
  currencyLogo: {
    marginRight: 10
  },
}));
const CurrencyList: React.FC<CurrencyListProps> = (props) => {
  const { children, className, onSelectCurrency, emptyStateLabel, showContribution, search, tokens, ...rest } = props;
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 12 });

  const getTokenBalance = (token: TokenInfo): BigNumber => {
    if (!walletState.wallet) return BIG_ZERO;

    const wallet: ConnectedWallet = walletState.wallet!;
    if (showContribution) {
      const contribution = token.pool?.userContribution || BIG_ZERO;
      return contribution;
    } else {
      const amount = token.balances && token.balances[wallet.addressInfo.byte20.toLowerCase()];
      if (!amount) return BIG_ZERO;

      return new BigNumber(amount.toString());
    }
  };
  const getContributionPercentage = (token: TokenInfo) => {
    if (!walletState.wallet) return BIG_ZERO;
    return token.pool?.contributionPercentage || BIG_ZERO;
  };


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
          onClick={() => onSelectCurrency(token)}>
          <ContrastBox className={classes.currencyBox}>
            <CurrencyLogo className={classes.currencyLogo} currency={token.whitelisted && token.symbol} />
            <Box display="flex" flexDirection="column">
              <Typography variant="h2">{token.symbol}</Typography>
              <Typography color="textSecondary" variant="body2">{token.isZil ? 'Zilliqa' : token.name}</Typography>
            </Box>
            <Box flex={1}>
              <Typography align="right" variant="h6" component="p">
                {moneyFormat(getTokenBalance(token), {
                  symbol: token.symbol,
                  maxFractionDigits: showContribution ? 5 : token.decimals,
                  compression: token.decimals,
                  showCurrency: true,
                })}
              </Typography>
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
