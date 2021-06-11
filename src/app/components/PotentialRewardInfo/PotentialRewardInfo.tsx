import { makeStyles } from "@material-ui/core";
import { PoolFormState, PoolZWAPReward, RewardsState, RootState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { BIG_ZERO } from "app/utils/constants";
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const weeklyRewards = useMemo(() => rewardsState.rewardByPools[poolState?.token?.address ?? ""]?.weeklyReward ?? BIG_ZERO, [poolState?.token?.address, rewardsState.rewardByPools]);

  const potentialRewards = useMemo(() => {
    const { token, addZilAmount } = poolState;
    const poolRewards: PoolZWAPReward | undefined = rewardsState.rewardByPools[token?.address ?? ""];

    if (!poolRewards || !rewardsState.epochInfo || !token?.pool || weeklyRewards.isZero()) return BIG_ZERO;

    const epochTimeLeftSeconds = Math.max(0, -dayjs().diff(rewardsState.epochInfo.nextEpoch, "second")) % rewardsState.epochInfo.raw.epoch_period;
    const timeWeight = epochTimeLeftSeconds / 3600;

    const zilReserveHuman = token.pool.zilReserve.shiftedBy(-12);

    // newPoolTokens = totalTokens * (addZil / totalZil)
    const newPoolTokens = zilReserveHuman.isZero() ? BIG_ZERO : (token.pool.totalContribution.times(addZilAmount.div(zilReserveHuman)));

    const newWeightedLiquidity = newPoolTokens.times(timeWeight);
    const rewardsShare = newWeightedLiquidity.div(poolRewards.weightedLiquidity.plus(newWeightedLiquidity));
    const potentialRewards = weeklyRewards.times(rewardsShare).decimalPlaces(5);

    return potentialRewards;
  }, [poolState, rewardsState.epochInfo, rewardsState.rewardByPools, weeklyRewards]);

  if (weeklyRewards.isZero()) return null;

  return (
    <KeyValueDisplay kkey={(
      <span>
        Est. Potential ZWAP Rewards
      </span>
    )} {...props}><span className={classes.textWrapper}><span className={classes.textColoured}>{potentialRewards.toFormat()}</span> ZWAP</span><HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." /></KeyValueDisplay>
  );
};

export default PotentialRewardInfo;
