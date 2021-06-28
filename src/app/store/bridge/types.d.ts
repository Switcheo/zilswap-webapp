import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Blockchain } from "tradehub-api-js";

export type BridgeableToken = {
  blockchain: Blockchain;
  tokenAddress: string;
  lockproxyAddress: string;
  denom: string;
  toBlockchain: Blockchain;
  toTokenAddress: string;
  toDenom: string;
}

export type BridgeableTokenMapping = {
  [Blockchain.Ethereum]: ReadonlyArray<BridgeableToken>;
  [Blockchain.Zilliqa]: ReadonlyArray<BridgeableToken>;
}

export interface BridgeState {
  formState: BridgeFormState;
  bridgeTxs: BridgeTx[];

  tokens: BridgeableTokenMapping;
}

export interface BridgeFormState {
  sourceAddress?: string; // can be eth or zil address
  destAddress?: string; // can be eth or zil address
  transferAmount: BigNumber;

  token?: TokenInfo; // might be a new DenomInfo

  isInsufficientReserves: boolean;
  forNetwork: Network | null,
};

export interface BridgeTx {
  srcChain: Blockchain;
  dstChain: Blockchain;

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
}
