import { makeStyles } from "@material-ui/core";
import { PoolFormState, RewardsState, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/constants";
import { BigNumber } from "bignumber.js"
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import HelpInfo from "../HelpInfo";
import KeyValueDisplay, { Props as KeyValueDisplayProps } from "../KeyValueDisplay";

interface Props extends KeyValueDisplayProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  textColoured: {
    color: theme.palette.primary.dark
  },
  textWrapper: {
    color: theme.palette.label
  }
}));

const PotentialRewardInfo: React.FC<Props> = (props: Props) => {
  const poolState = useSelector<RootState, PoolFormState>(store => store.pool);
  const rewardsState = useSelector<RootState, RewardsState>(store => store.rewards);
  const classes = useStyles();

  const potentialRewards = useMemo(() => {
    const rewards: { amount: BigNumber, symbol: string, name: string }[] = [];

    const { token, addZilAmount } = poolState;
    if (!token || !token.pool) return rewards;

    const weeklyRewards = rewardsState.rewardsByPool[token.address]
    if (!weeklyRewards) return rewards;

    for (const reward of weeklyRewards) {
      const timeLeft = Math.max(0, dayjs.unix(reward.currentEpochEnd).diff(dayjs(), "second"))
      const timeWeight = timeLeft / 3600
      const zilReserveHuman = token.pool.zilReserve.shiftedBy(-12);
      // userPoolTokens = totalTokens * (addZil / totalZil)
      const userPoolTokens = zilReserveHuman.isZero() ? BIG_ZERO : (token.pool.totalContribution.times(addZilAmount.div(zilReserveHuman)));
      const newWeightedLiquidity = userPoolTokens.times(timeWeight);
      const rewardsShare = newWeightedLiquidity.div(reward.weightedLiquidity.plus(newWeightedLiquidity));
      const potentialRewards = reward.amountPerEpoch.shiftedBy(-reward.rewardToken.decimals).times(rewardsShare).decimalPlaces(5);

      rewards.push({
        amount: potentialRewards,
        symbol: reward.rewardToken.symbol,
        name: reward.distributorName,
      })
    }

    return rewards;
  }, [poolState, rewardsState.rewardsByPool]);

  return (<React.Fragment>
    {
      potentialRewards.map(reward =>
        <KeyValueDisplay
          kkey={(
            <span>
              Est. Rewards From {reward.name}
            </span>
          )}
          {...props}
        >
          <span className={classes.textWrapper}>
            <span className={classes.textColoured}>{reward.amount.toFormat()}</span> {reward.symbol}
          </span>
          <HelpInfo placement="top" title={`Estimated rewards for current epoch based on current liquidity and time left.`} />
        </KeyValueDisplay>
      )
    }
  </React.Fragment>)
};

export default PotentialRewardInfo;
