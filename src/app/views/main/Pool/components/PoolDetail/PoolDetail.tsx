import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import React, { useEffect, useState } from "react";
import { KeyValueDisplay } from "app/components";
import { TokenInfo } from "app/store/types";
import { Pool, ZilswapConnector } from "core/zilswap";
import { useMoneyFormatter } from "app/utils";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";

export interface PoolDetailProps extends BoxProps {
  token?: TokenInfo;
};

const useStyles = makeStyles(theme => ({
  root: {
  },
}));
const PoolDetail: React.FC<PoolDetailProps> = (props: PoolDetailProps) => {
  const { children, className, token, ...rest } = props;
  const [pool, setPool] = useState<Pool | undefined>();
  const classes = useStyles();
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5 });

  const zilFormatOpts: MoneyFormatterOptions = {
    symbol: "ZIL",
    compression: 12,
    showCurrency: true,
  };
  const formatOpts: MoneyFormatterOptions = {
    symbol: token?.symbol,
    compression: token?.decimals,
    showCurrency: true,
  };

  useEffect(() => {
    if (!token) return setPool(undefined);
    const pool = ZilswapConnector.getPool(token.address) || undefined;
    setPool(pool);
  }, [token]);

  const getExchangeRateValue = () => {
    if (!pool || !token) return "-";
    const rate = pool.exchangeRate;
    return `1 ZIL = ${rate.toNumber().toLocaleString("en-US", { maximumFractionDigits: 5 })} ${token!.symbol}`;
  };
  const getPoolSizeValue = () => {
    if (!pool || !token) return "-";
    const { tokenReserve, zilReserve } = pool;
    return `${moneyFormat(zilReserve, zilFormatOpts)} + ${moneyFormat(tokenReserve, formatOpts)}`;
  };
  const getShareValue = () => {
    if (!pool || !token) return "-";
    const { userContribution } = pool;
    return `${moneyFormat(0, zilFormatOpts)} + ${moneyFormat(userContribution, formatOpts)}`;
  };
  const getUserPoolShare = () => {
    if (!pool || !token) return "%";
    const { contributionPercentage } = pool;
    return `${contributionPercentage.toFixed(3)} %`;
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