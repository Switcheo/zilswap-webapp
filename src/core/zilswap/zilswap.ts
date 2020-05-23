import { Contract } from '@zilliqa-js/contract';
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { ConnectedWallet, WalletConnectType } from "core/wallet/ConnectedWallet";
import { Zilswap } from "zilswap-sdk";
import { Network, TOKENS } from "zilswap-sdk/lib/constants";
import BigNumber from 'bignumber.js';


export interface ConnectProps {
  wallet: ConnectedWallet;
  network: Network;
};

export interface AddLiquidityProps {
  tokenID: string;
  zilAmount: string;
  tokenAmount: string;
  maxExchangeRateChange?: number;
}

export interface RemoveLiquidityProps {
  tokenID: string;
  contributionAmount: string;
  maxExchangeRateChange?: number;
}

/**
 * Filler for unexported type from zilswap-sdk
 */
type TokenDetails = {
  contract: Contract;
  address: string;
  hash: string;
  symbol: string;
  decimals: number;
};

/**
 * Filler for unexported type from zilswap-sdk
 */
type Pool = {
  zilReserve: BigNumber;
  tokenReserve: BigNumber;
  exchangeRate: BigNumber;
  totalContribution: BigNumber;
  userContribution: BigNumber;
  contributionPercentage: BigNumber;
};

type ConnectorState = {
  zilswap: Zilswap;
  wallet: ConnectedWallet;
};

let connectorState: ConnectorState | null = null;

const getState = (): ConnectorState => {
  if (connectorState === null)
    throw new Error("not connected");
  return connectorState!;
};

/**
 * Constructor for Zilswap SDK wrapper. Must populate connectorState if executed, 
 * throws error otherwise. 
 * 
 * @param wallet 
 */
const initializeForWallet = async (wallet: ConnectedWallet): Promise<Zilswap> => {
  switch (wallet.type) {
    case WalletConnectType.PrivateKey:
      const zilswap = new Zilswap(wallet.network, wallet.addressInfo.privateKey!);
      connectorState = { zilswap, wallet };
      return zilswap;
    case WalletConnectType.Moonlet:
      throw new Error("moonlet support under development");
    default:
      throw new Error("unknown wallet connector");
  }
};

export class ZilswapConnector {
  static connect = async (props: ConnectProps) => {
    await initializeForWallet(props.wallet);
    await getState().zilswap.initialize();

    console.log("zilswap connection established");
  };

  static getTokens = (): TokenDetails[] => {
    const { zilswap } = getState();
    const { tokens } = zilswap.getAppState();
    const tokensArray = Object.keys(tokens).map(hash => tokens[hash]);
    return ((tokensArray! as unknown) as TokenDetails[]);
  };

  static getPool = (tokenID: string): Pool | null => {
    const { zilswap } = getState();
    return zilswap.getPool(tokenID);
  };

  static addLiquidity = async (props: AddLiquidityProps) => {
    const { zilswap } = getState();

    const txReceipt = await zilswap.addLiquidity(
      props.tokenID,
      props.zilAmount,
      props.tokenAmount,
      props.maxExchangeRateChange);

    return txReceipt;
  };

  static removeLiquidity = async (props: RemoveLiquidityProps) => {
    const { zilswap } = getState();

    const txReceipt = await zilswap.removeLiquidity(
      props.tokenID,
      props.contributionAmount,
      props.maxExchangeRateChange);

    return txReceipt;
  };

  static disconnect = async (): Promise<void> => {
    const { zilswap } = getState();
    await zilswap.teardown();
  };
}