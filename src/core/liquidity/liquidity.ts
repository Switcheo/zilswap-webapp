import { getZilliqa } from "core/zilliqa";
import { useDispatch } from "react-redux";
import actions from "app/store/actions";

export interface AddLiquidityProps {
  tokenId: string;
  zilAmount: string;
  tokenAmount: string;
  maxExchangeRateChange?: number;
}

export interface RemoveLiquidityProps {
  tokenId: string;
  contributionAmount: string;
  maxExchangeRateChange?: number;
}

export interface PoolProps {
  tokenId: string;
}

export const addLiquidity = async (addProps: AddLiquidityProps) => {
  let zilswap = getZilliqa();
  if (!zilswap) return;

  const { tokenId, zilAmount, tokenAmount, maxExchangeRateChange } = addProps;

  await zilswap.initialize();
  await zilswap.addLiquidity(tokenId, zilAmount, tokenAmount, maxExchangeRateChange);
  await zilswap.teardown()
}

export const removeLiquidity = async (removeProps: RemoveLiquidityProps) => {
  let zilswap = getZilliqa();
  if (!zilswap) return;
  const { tokenId, contributionAmount, maxExchangeRateChange } = removeProps;
  await zilswap.initialize();
  await zilswap.removeLiquidity(tokenId, contributionAmount, maxExchangeRateChange);
  await zilswap.teardown()
}