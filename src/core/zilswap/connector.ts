import { TxReceipt } from "@zilliqa-js/account";
import { Contract } from "@zilliqa-js/contract";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import BigNumber from "bignumber.js";
import { ConnectedWallet, WalletConnectType } from "core/wallet/ConnectedWallet";
import { Zilswap } from "zilswap-sdk";
import { APIS, Network } from "zilswap-sdk/lib/constants";


export interface ConnectProps {
  wallet: ConnectedWallet;
  network: Network;
};

export interface AddLiquidityProps {
  tokenID: string;
  zilAmount: BigNumber;
  tokenAmount: BigNumber;
  maxExchangeRateChange?: number;
}

export interface RemoveLiquidityProps {
  tokenID: string;
  contributionAmount: BigNumber;
  maxExchangeRateChange?: number;
}
export interface SwapProps {
  exactOf: "in" | "out";
  tokenInID: string;
  tokenOutID: string;
  amount: BigNumber;
  maxAdditionalSlippage?: number;
}

/**
 * Filler for unexported type from zilswap-sdk
 */
export type TokenDetails = {
  contract: Contract;
  address: string;
  hash: string;
  symbol: string;
  decimals: number;
};

/**
 * Filler for unexported type from zilswap-sdk
 */
export type Pool = {
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

const handleTxReceipt = (txReceipt: TxReceipt) => {
  // @ts-ignore
  if (txReceipt.exceptions?.length) {
    // @ts-ignore
    throw txReceipt.exceptions[0];
  }
};
export class ZilswapConnector {
  static network?: Network;

  static connect = async (props: ConnectProps) => {
    await initializeForWallet(props.wallet);
    ZilswapConnector.network = props.network;

    await getState().zilswap.initialize();

    console.log("zilswap connection established");
  };

  static getZilliqa = () => {
    const { zilswap } = getState();
    return new Zilliqa(APIS[zilswap.network]);
  };

  static getZilswapState = () => {
    const { zilswap } = getState();
    return zilswap.getAppState();
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

    console.log(props.tokenID);
    console.log(props.zilAmount.toString());
    console.log(props.tokenAmount.toString());
    console.log(props.maxExchangeRateChange);
    const txReceipt = await zilswap.addLiquidity(
      props.tokenID,
      props.zilAmount.toString(),
      props.tokenAmount.toString(),
      props.maxExchangeRateChange);
    handleTxReceipt(txReceipt);

    return txReceipt;
  };

  static removeLiquidity = async (props: RemoveLiquidityProps) => {
    const { zilswap } = getState();

    console.log(props.tokenID);
    console.log(props.contributionAmount.toString());
    console.log(props.maxExchangeRateChange);
    const txReceipt = await zilswap.removeLiquidity(
      props.tokenID,
      props.contributionAmount.toString(),
      props.maxExchangeRateChange);
    handleTxReceipt(txReceipt);

    return txReceipt;
  };

  static swap = async (props: SwapProps) => {
    const { zilswap } = getState();

    const swapFunction = props.exactOf === "in" ?
      zilswap.swapWithExactInput.bind(zilswap) :
      zilswap.swapWithExactOutput.bind(zilswap);

    console.log(props.exactOf);
    console.log(props.tokenInID);
    console.log(props.tokenOutID);
    console.log(props.amount.toString());
    console.log(props.maxAdditionalSlippage);
    const txReceipt = await swapFunction(
      props.tokenInID,
      props.tokenOutID,
      props.amount.toString(),
      props.maxAdditionalSlippage);
    handleTxReceipt(txReceipt);

    return txReceipt;
  };

  static disconnect = async (): Promise<void> => {
    const { zilswap } = getState();
    ZilswapConnector.network = undefined;
    await zilswap.teardown();
  };
}