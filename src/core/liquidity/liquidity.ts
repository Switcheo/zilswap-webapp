import { getZilliqa } from "core/zilliqa";
import { useDispatch } from "react-redux";
import actions from "app/store/actions";

export interface AddLiquidityProps {
  tokenId: string;
  zilAmount: string;
  tokenAmount: string;
  maxExchangeRageChange?: number;
}

export interface RemoveLiquidityProps {
  tokenId: string;
  contributionAmount: string;
  maxExchangeRageChange?: number;
}

export interface PoolProps {
  tokenId: string;
}

export const addLiquidity = async (addProps: AddLiquidityProps) => {
  let zilswap = getZilliqa();
  if (!zilswap) return;

  const { tokenId, zilAmount, tokenAmount, maxExchangeRageChange } = addProps;

  await zilswap.initialize();
  await zilswap.addLiquidity(tokenId, zilAmount, tokenAmount, maxExchangeRageChange);
  await zilswap.teardown()
}

export const removeLiquidity = async (removeProps: RemoveLiquidityProps) => {
  let zilswap = getZilliqa();
  if (!zilswap) return;
  const { tokenId, contributionAmount, maxExchangeRageChange } = removeProps;
  await zilswap.initialize();
  await zilswap.removeLiquidity(tokenId, contributionAmount, maxExchangeRageChange);
  await zilswap.teardown()
}