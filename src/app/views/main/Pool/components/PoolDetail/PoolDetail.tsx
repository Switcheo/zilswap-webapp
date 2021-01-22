import { Box, BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HelpInfo, KeyValueDisplay } from "app/components";
import { RewardsState, RootState, TokenInfo, TokenState } from "app/store/types";
import { useMoneyFormatter } from "app/utils";
import { BIG_ZERO, ZIL_TOKEN_NAME } from "app/utils/constants";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import cls from "classnames";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

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
  const tokenState = useSelector<RootState, TokenState>(store => store.token);
  const rewardsState = useSelector<RootState, RewardsState>(store => store.rewards);
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
  const getUserPoolShare = () => {
    if (!token?.pool) return "%";
    const { contributionPercentage } = token.pool;
    return `${contributionPercentage.toFixed(1)}%`;
  };

  const [weeklyZwapRewards, potentialRewards] = useMemo(() => {
    if (!token) return [BIG_ZERO, BIG_ZERO];
    const weeklyZwapRewards = rewardsState.rewardByPools[token.address]?.weeklyReward ?? BIG_ZERO;

    if (!token?.pool) return [weeklyZwapRewards, BIG_ZERO];
    const potentialRewards = token.pool.contributionPercentage.shiftedBy(-2).times(weeklyZwapRewards).decimalPlaces(5);
    return [weeklyZwapRewards, potentialRewards];

    // eslint-disable-next-line
  }, [token?.address, rewardsState.rewardByPools]);

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <KeyValueDisplay kkey={"Exchange Rate"} mb="8px">{getExchangeRateValue()}</KeyValueDisplay>
      <KeyValueDisplay kkey={"Current Pool Size"} mb="8px">{getPoolSizeValue()}</KeyValueDisplay>
      <KeyValueDisplay kkey={`Your Current Pool Share (${getUserPoolShare()})`} mb="8px">{getShareValue()}</KeyValueDisplay>
      {weeklyZwapRewards.gt(0) && (
        <KeyValueDisplay kkey={(
          <span>
            Potential ZWAP Rewards
            <HelpInfo placement="top" title="Weekly ZWAP rewards emmitted every epoch based on your time-weighted pool share." />
          </span>
        )}>{potentialRewards.toFormat()} ZWAP</KeyValueDisplay>
      )}
    </Box>
  );
};

export default PoolDetail;
