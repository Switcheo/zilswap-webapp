import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpInfo, KeyValueDisplay } from "app/components";
import { RootState, SwapFormState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import { ZIL_TOKEN_NAME } from "app/utils/constants";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";

export interface SwapDetailProps extends BoxProps {
  token?: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  textColoured: {
    color: theme.palette.primary.dark
  }
}));
const SwapDetail: React.FC<SwapDetailProps> = (props: SwapDetailProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const { inAmount, outAmount, inToken, outToken, expectedSlippage } = useSelector<RootState, SwapFormState>(store => store.swap);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5, showCurrency: true });

  const zilFormatOpts: MoneyFormatterOptions = {
    symbol: "ZIL",
    compression: 12,
  };
  const formatOpts: MoneyFormatterOptions = {
    symbol: token?.symbol,
    compression: token?.decimals,
  };

  const getExchangeRateValue = () => {
    if (!token?.pool) return "-";
    const zilToken = tokenState.tokens[ZIL_TOKEN_NAME];
    const rate = token.pool.exchangeRate.shiftedBy(token!.decimals - zilToken.decimals).pow(-1);
    return (
      <span>1 ZIL = <span className={classes.textColoured}>{rate.toNumber().toLocaleString("en-US", { maximumFractionDigits: 12 })}</span> {token!.symbol}</span>
    )
  };
  const getMinimumValue = () => {
    if (outAmount.isEqualTo(0)) return "-";
    return (
      <span><span className={classes.textColoured}>{moneyFormat(outAmount, { maxFractionDigits: outToken?.decimals })}</span> {outToken?.symbol}</span>
    )
  };

  const getPriceImpact = () => {
    if (!expectedSlippage) return "-"
    return (
      <span className={classes.textColoured}>{moneyFormat((expectedSlippage || 0) * 100)}%</span>
    )
  }

  const getFeeValue = () => {
    if (!token?.pool) return "-";
    const { contributionPercentage, zilReserve, tokenReserve } = token.pool;

    const share = contributionPercentage.shiftedBy(-2);
    const tokenContribution = share.times(tokenReserve);
    const zilContribution = share.times(zilReserve);
    return `${moneyFormat(zilContribution, zilFormatOpts)} + ${moneyFormat(tokenContribution, formatOpts)}`;
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <KeyValueDisplay kkey={"Price"} mb="8px">{getExchangeRateValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Min. Received"} mb="8px">{getMinimumValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Price Impact"} mb="8px">{getPriceImpact()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Estimated Fee"} mb="8px">{getFeeValue()} <HelpInfo placement="top" title="Liquidity providers will receive 0.3% of this trade." /></KeyValueDisplay>
    </Box>
  );
};

export default SwapDetail;
