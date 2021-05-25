import { PoolFormState, PoolZWAPReward, RewardsState, RootState } from "app/store/types";
import { BIG_ZERO } from "app/utils/constants";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import HelpInfo from "../HelpInfo";
import KeyValueDisplay, { Props as KeyValueDisplayProps } from "../KeyValueDisplay";

interface Props extends KeyValueDisplayProps {

}

const PotentialRewardInfo: React.FC<Props> = (props: Props) => {
  const poolState = useSelector<RootState, PoolFormState>(store => store.pool);
  const rewardsState = useSelector<RootState, RewardsState>(store => store.rewards);

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
  }, [poolState, rewardsState, weeklyRewards]);

  if (weeklyRewards.isZero()) return null;

  return (
    <KeyValueDisplay kkey={(
      <span>
        Est. Potential ZWAP Rewards
        <HelpInfo placement="top" title="Your time-weighted pool share estimated based on current liquidity." />
      </span>
    )} {...props}>{potentialRewards.toFormat()} ZWAP</KeyValueDisplay>
  );
};

export default PotentialRewardInfo;
