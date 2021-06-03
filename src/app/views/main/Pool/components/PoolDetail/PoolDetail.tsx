import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpInfo, KeyValueDisplay, PotentialRewardInfo } from "app/components";
import { LayoutState, RootState, TokenInfo, TokenState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ZERO, ZIL_TOKEN_NAME } from "app/utils/constants";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import BigNumber from "bignumber.js";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";

export interface PoolDetailProps extends BoxProps {
  token?: TokenInfo;
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  textBold: {
    fontWeight: "bold"
  }
}));
const PoolDetail: React.FC<PoolDetailProps> = (props: PoolDetailProps) => {
  const { children, className, token, ...rest } = props;
  const classes = useStyles();
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const layoutState = useSelector<RootState, LayoutState>(store => store.layout);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const moneyFormat = useMoneyFormatter({ maxFractionDigits: 5, showCurrency: true });

  const liquidityTokenRate = poolToken?.pool?.totalContribution.isPositive() ? poolToken!.pool!.tokenReserve.div(poolToken!.pool!.totalContribution) : BIG_ZERO;

  const zilFormatOpts: MoneyFormatterOptions = {
    // symbol: "ZIL",
    compression: 12,
  };
  const formatOpts: MoneyFormatterOptions = {
    // symbol: token?.symbol,
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
  const getPoolSizeValue = () => {
    if (!token?.pool) return "-";
    const { zilReserve, tokenReserve } = token.pool;
    return (
      <span><span className={classes.textColoured}>{moneyFormat(zilReserve, zilFormatOpts)}</span> ZIL + <span className={classes.textColoured}>{moneyFormat(tokenReserve, formatOpts)}</span> {token!.symbol}</span>
    )
  };
  const getShareValue = () => {
    if (!token?.pool) return "-";
    const { contributionPercentage, zilReserve, tokenReserve } = token.pool;

    const share = contributionPercentage.shiftedBy(-2);
    const tokenContribution = share.times(tokenReserve);
    const zilContribution = share.times(zilReserve);
    return (
      <span> (<span className={classes.textColoured}>{moneyFormat(zilContribution, zilFormatOpts)}</span> ZIL + <span className={classes.textColoured}>{moneyFormat(tokenContribution, formatOpts)}</span> {token!.symbol})</span>
    )
  };
  const getUserPoolShare = () => {
    if (!token?.pool) return "";
    const { contributionPercentage } = token.pool;
    return `${contributionPercentage.toFixed(1)}%`;
  };
  const getPoolTokenValue = () => {
    if (!token?.pool) return "-";
    return (
      <span>
        <span className={classes.textColoured}>{moneyFormat(new BigNumber(liquidityTokenRate).times(poolToken?.pool?.exchangeRate || 0), { ...zilFormatOpts, compression: 0 })}</span>
        {" "}ZIL + {" "}
        <span className={classes.textColoured}>{moneyFormat(new BigNumber(liquidityTokenRate).shiftedBy(poolToken?.decimals || 0), formatOpts)}</span>
        {" "}{token!.symbol}
      </span>
    )
  };

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <KeyValueDisplay kkey={"Price"} mb="8px">{getExchangeRateValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      {layoutState.showPoolType === "remove" && (
        <KeyValueDisplay kkey={"Pool Token Value"} mb="8px">{getPoolTokenValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      )}
      <KeyValueDisplay kkey={"Current Pool Size"} mb="8px">{getPoolSizeValue()} <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
      <KeyValueDisplay kkey={"Current Pool Share"} mb="8px">
        <span className={cls(classes.textColoured, classes.textBold)}>{getUserPoolShare()}</span> 
        {getShareValue()}<HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." />
      </KeyValueDisplay>
      {layoutState.showPoolType === "add" && (
        <PotentialRewardInfo />
      )}
    </Box>
  );
};

export default PoolDetail;
