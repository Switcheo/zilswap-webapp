import { BRIDGEABLE_EVM_CHAINS } from 'app/utils'
import BigNumber from "bignumber.js";
import { Models } from "carbon-js-sdk";
import { Blockchain } from 'carbon-js-sdk/lib'
import { Token } from 'carbon-js-sdk/lib/codec'
import dayjs from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";

export type BridgeableToken = {
  blockchain: Blockchain;
  tokenAddress: string;
  lockproxyAddress: string;
  decimals: number; 
  denom: string;    // carbon denom
  tokenId: string;  // tradehub denom
  chains: Record<string, string>
}

export type BridgeableTokenMapping = ReadonlyArray<BridgeableToken>;

export interface BridgeState {
  formState: BridgeFormState;
  bridgeTxs: BridgeTx[];
  activeBridgeTx?: BridgeTx;
  previewBridgeTx?: BridgeTx;

  tokens: BridgeableTokenMapping;
}

export type BridgeableEvmChains = typeof BRIDGEABLE_EVM_CHAINS[number]

/**
 * BridgeableChains are the chains supported on Zilbridge.
 * Currently it supports the bridgeable EVM chains and the native chain.
 */
export type BridgeableChains = BridgeableEvmChains | Blockchain.Zilliqa

export interface WithdrawFee {
  amount: BigNumber;
  value: BigNumber;
  token?: Models.Token;
}

export interface BridgeFormState {
  sourceAddress?: string; // can be evm or zil address
  destAddress?: string; // can be evm or zil address
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

  network: Network;

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

  // used for bridge txs
  srcTokenId: string;
  dstTokenId: string;

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

  // Carbon external transfers confirmed
  depositTxConfirmedAt?: dayjs.Dayjs;

  // Carbon withdraw tx
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

  // block confirmations
  depositConfirmations?: number;
}
