import { TokenInfo } from "app/store/types";
import { ChainTransferFlow } from "app/views/main/Bridge/components/constants";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Blockchain, RestModels } from "tradehub-api-js";
import { FeesData } from "core/utilities/bridge";

export type BridgeableToken = {
  blockchain: Blockchain;
  tokenAddress: string;
  lockproxyAddress: string;
  denom: string;
  toBlockchain: Blockchain;
  toTokenAddress: string;
  toDenom: string;
  balDenom: string;
}

export type BridgeableTokenMapping = {
  [Blockchain.Ethereum]: ReadonlyArray<BridgeableToken>;
  [Blockchain.Zilliqa]: ReadonlyArray<BridgeableToken>;
}

export interface BridgeState {
  formState: BridgeFormState;
  bridgeTxs: BridgeTx[];
  activeBridgeTx?: BridgeTx;

  tokens: BridgeableTokenMapping;
}

export type BridgeableChains = Blockchain.Ethereum | Blockchain.Zilliqa;
export interface WithdrawFee {
  amount: BigNumber;
  value: BigNumber;
  token?: RestModels.Token;
}

export interface BridgeFormState {
  sourceAddress?: string; // can be eth or zil address
  destAddress?: string; // can be eth or zil address
  transferAmount: BigNumber;
  fromBlockchain: BridgeableChains;
  toBlockchain: BridgeableChains;

  token?: BridgeableToken;
  withdrawFee?: WithdrawFee;

  isInsufficientReserves: boolean;
  forNetwork: Network | null,
};

export interface BridgeTx {
  srcChain: BridgeableChains;
  dstChain: BridgeableChains;

  // in respective display formats
  // zil: bech32 (zil1…)
  // eth: hex (0x…)
  // bsc: hex (0x…)
  // neo: base58check
  srcAddr: string;
  dstAddr: string;

  // token denom
  srcToken: string;
  dstToken: string;

  // allocated withdraw fee
  withdrawFee: BigNumber;

  // unitless amount
  inputAmount: BigNumber;

  // used to generate interim address
  interimAddrMnemonics: string;

  // source chain token spend tx
  approveTxHash?: string;

  // .lock tx on the source chain
  sourceTxHash?: string;

  // TradeHub external transfers confirmed
  depositTxConfirmedAt?: dayjs.Dayjs;

  // TradeHub withdraw tx
  withdrawTxHash?: string;

  // tx on the destination chain
  destinationTxHash?: string;

  // populated when bridge tx is deemed complete
  destinationTxConfirmedAt?: dayjs.Dayjs;

  // dismissed by user, hide from UI
  dismissedAt?: dayjs.Dayjs;

  // deposit tx failure detected at
  depositFailedAt?: dayjs.Dayjs;

  // populated when bridge tx is added
  depositDispatchedAt?: dayjs.Dayjs;
}
