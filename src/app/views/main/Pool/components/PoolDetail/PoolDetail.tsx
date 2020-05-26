import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { KeyValueDisplay } from "app/components";
import { TokenInfo } from "app/store/types";
import { useMoneyFormatter } from "app/utils";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import cls from "classnames";
import React from "react";

export interface PoolDetailProps extends BoxProps {
  token?: TokenInfo;
};

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const PoolDetail: React.FC<PoolDetailProps> = (props: PoolDetailProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
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
    const rate = token.pool.exchangeRate.pow(-1);
    return `1 ZIL = ${rate.toNumber().toLocaleString("en-US", { maximumFractionDigits: 5 })} ${token!.symbol}`;
  };
  const getPoolSizeValue = () => {
    if (!token?.pool) return "-";
    const { exchangeRate, totalContribution } = token.pool;
    const zilAmount = totalContribution.times(exchangeRate);
    return `${moneyFormat(zilAmount,zilFormatOpts)} + ${moneyFormat(totalContribution, formatOpts)}`;
  };
  const getShareValue = () => {
    if (!token?.pool) return "-";
    const { userContribution, exchangeRate } = token.pool;
    const zilContribution = userContribution.times(exchangeRate);
    return `${moneyFormat(zilContribution, zilFormatOpts)} + ${moneyFormat(userContribution, formatOpts)}`;
  };
  const getUserPoolShare = () => {
    if (!token?.pool) return "%";
    const { contributionPercentage } = token.pool;
    return `${contributionPercentage.toFixed(3)}%`;
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <KeyValueDisplay kkey={"Exchange Rate"} value={getExchangeRateValue()} mb="8px" />
      <KeyValueDisplay kkey={"Current Pool Size"} value={getPoolSizeValue()} mb="8px" />
      <KeyValueDisplay kkey={`Your Pool Share (${getUserPoolShare()})`} value={getShareValue()} />
    </Box>
  );
};

export default PoolDetail;