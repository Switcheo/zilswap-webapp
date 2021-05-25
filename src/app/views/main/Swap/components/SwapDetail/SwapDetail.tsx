import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { KeyValueDisplay, HelpInfo } from "app/components";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { useMoneyFormatter } from "app/utils";
import { ZIL_TOKEN_NAME } from "app/utils/constants";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";

export interface SwapDetailProps extends BoxProps {
  token?: TokenInfo;
};

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const SwapDetail: React.FC<SwapDetailProps> = (props: SwapDetailProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  // const layoutState = useSelector<RootState, LayoutState>(store => store.layout);
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
    return `1 ZIL = ${rate.toNumber().toLocaleString("en-US", { maximumFractionDigits: 12 })} ${token!.symbol}`;
  };
  const getPoolSizeValue = () => {
    if (!token?.pool) return "-";
    const { zilReserve, tokenReserve } = token.pool;
    return `${moneyFormat(zilReserve, zilFormatOpts)} + ${moneyFormat(tokenReserve, formatOpts)}`;
  };
  const getShareValue = () => {
    if (!token?.pool) return "-";
    const { contributionPercentage, zilReserve, tokenReserve } = token.pool;

    const share = contributionPercentage.shiftedBy(-2);
    const tokenContribution = share.times(tokenReserve);
    const zilContribution = share.times(zilReserve);
    return `${moneyFormat(zilContribution, zilFormatOpts)} + ${moneyFormat(tokenContribution, formatOpts)}`;
  };
  // const getUserPoolShare = () => {
  //   if (!token?.pool) return "%";
  //   const { contributionPercentage } = token.pool;
  //   return `${contributionPercentage.toFixed(1)}%`;
  // };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <KeyValueDisplay kkey={"Price"} mb="8px">{getExchangeRateValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Minimum Received"} mb="8px">{getPoolSizeValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Price Impact"} mb="8px">{getShareValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Estimated Fee"} mb="8px">{getShareValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
    </Box>
  );
};

export default SwapDetail;
