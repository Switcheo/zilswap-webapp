import { Zilliqa } from "@zilliqa-js/zilliqa";
import BigNumber from "bignumber.js";
import { ConnectedWallet, WalletConnectType } from "core/wallet/ConnectedWallet";
import { ObservedTx, Pool, TokenDetails, Zilswap, OnUpdate, TxStatus, TxReceipt } from "zilswap-sdk";
import { APIS, Network } from "zilswap-sdk/lib/constants";


export interface ConnectProps {
  wallet: ConnectedWallet;
  network: Network;
  observedTxs?: ObservedTx[];
};

export interface ExchangeRateQueryProps {
  exactOf: "in" | "out";
  tokenInID: string;
  tokenOutID: string;
  amount: BigNumber;
};

export interface AddLiquidityProps {
  tokenID: string;
  zilAmount: BigNumber;
  tokenAmount: BigNumber;
  maxExchangeRateChange?: number;
};

export interface RemoveLiquidityProps {
  tokenID: string;
  contributionAmount: BigNumber;
  maxExchangeRateChange?: number;
};
export interface SwapProps {
  exactOf: "in" | "out";
  tokenInID: string;
  tokenOutID: string;
  amount: BigNumber;
  maxAdditionalSlippage?: number;
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
 * @param wallet `ConnectedWallet` instance to provide blockchain connection interface.
 * @returns Promise<Zilswap> Zilswap instance initialized with wallet properties (network and provider).
 * @throws "moonlet support under development" when providing MoonletConnectedWallet.
 * @throws "unknown wallet connector" when wallet type unknown.
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

/**
 * Checks transaction receipt for error, and throw the top level exception
 * if any.
 * 
 * @param txReceipt `@zilliqa-js` blockchain transaction receipt
 */
const handleObservedTx = (observedTx: ObservedTx) => {
  // // @ts-ignore
  // if (txReceipt.exceptions?.length) {
  //   // @ts-ignore
  //   throw txReceipt.exceptions[0];
  // }
};

/**
 * Abstraction class for Zilswap SDK.
 * 
 * @member network {@link Zilswap.Network}
 */
export class ZilswapConnector {
  static network?: Network;
  private static observer: OnUpdate | null;

  private static mainObserver: OnUpdate = (tx: ObservedTx, status: TxStatus, receipt?: TxReceipt) => {
    console.log("main observer", tx.hash, status);
    try {
      if (ZilswapConnector.observer)
        ZilswapConnector.observer(tx, status, receipt);
    } catch (e) {
      console.log("error processing observeTx update", e);
    }
  };

  /**
   * 
   * 
   */
  static registerObserver = (observer: OnUpdate | null) => {
    console.log("connector register observer");
    ZilswapConnector.observer = observer;
  };

  /**
   * 
   */
  static connect = async (props: ConnectProps) => {
    await initializeForWallet(props.wallet);
    ZilswapConnector.network = props.network;

    const observedTxs = props.observedTxs || [];

    await getState().zilswap.initialize(ZilswapConnector.mainObserver, observedTxs);

    console.log("zilswap connection established");
  };

  /**
   * Get a fresh instance of Zilliqa with the connector's network.
   * 
   * @returns Zilliqa instance
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getZilliqa = () => {
    const { zilswap } = getState();
    return new Zilliqa(APIS[zilswap.network]);
  };

  /**
   * Get the app state of the Zilswap SDK.
   * 
   * @returns the app state
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getZilswapState = () => {
    const { zilswap } = getState();
    return zilswap.getAppState();
  };

  /**
   * Get list of tokens found in the Zilswap SDK app state.
   * 
   * @returns array of tokens in Zilswap SDK's TokenDetails representation.
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getTokens = (): TokenDetails[] => {
    const { zilswap } = getState();
    const { tokens } = zilswap.getAppState();
    const tokensArray = Object.keys(tokens).map(hash => tokens[hash]);
    return ((tokensArray! as unknown) as TokenDetails[]);
  };

  /**
   * Get the pool of the provided token, or `null` if pool does not yet
   * exist on the contract.
   * 
   * @returns the pool instance
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getPool = (tokenID: string): Pool | null => {
    const { zilswap } = getState();
    return zilswap.getPool(tokenID);
  };

  /**
   * 
   * 
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static setDeadlineBlocks = (blocks: number) => {
    const { zilswap } = getState();
    return zilswap.setDeadlineBlocks(blocks);
  };

  /**
   * 
   * 
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getExchangeRate = async (props: ExchangeRateQueryProps) => {
    const { zilswap } = getState();
    const queryFunction = props.exactOf === "in" ?
      zilswap.getRatesForInput.bind(zilswap) : zilswap.getRatesForOutput.bind(zilswap);
    return await queryFunction(
      props.tokenInID,
      props.tokenOutID,
      props.amount.toString());
  };

  /**
   * Abstraction for Zilswap SDK functions
   * `addLiquidity`
   * 
   * @param tokenID string
   * @param zilAmount BigNumber
   * @param tokenAmount BigNumber
   * @param maxExchangeRateChange number?
   * @see zilswap-sdk documentation
   * 
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static addLiquidity = async (props: AddLiquidityProps) => {
    const { zilswap } = getState();

    console.log(props.tokenID);
    console.log(props.zilAmount.toString());
    console.log(props.tokenAmount.toString());
    console.log(props.maxExchangeRateChange);
    const observedTx = await zilswap.addLiquidity(
      props.tokenID,
      props.zilAmount.toString(),
      props.tokenAmount.toString(),
      props.maxExchangeRateChange);
    handleObservedTx(observedTx);

    return observedTx;
  };

  /**
   * Abstraction for Zilswap SDK functions
   * `removeLiquidity`
   * 
   * @param tokenID string
   * @param contributionAmount BigNumber
   * @param maxExchangeRateChange number?
   * @see zilswap-sdk documentation
   * 
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static removeLiquidity = async (props: RemoveLiquidityProps) => {
    const { zilswap } = getState();

    console.log(props.tokenID);
    console.log(props.contributionAmount.toString());
    console.log(props.maxExchangeRateChange);
    const observedTx = await zilswap.removeLiquidity(
      props.tokenID,
      props.contributionAmount.toString(),
      props.maxExchangeRateChange);
    handleObservedTx(observedTx);

    return observedTx;
  };

  /**
   * Abstraction for Zilswap SDK functions
   * `swapWithExactInput` and `swapWithExactOutput`
   * 
   * "in" refers to the transfer of value *into* Zilswap contract
   * "out" refers to the transfer of value *out* of Zilswap contract
   * 
   * @param exactOf  "in" | "out" - used to determine with exact swap function to use.
   * @param tokenInID string
   * @param tokenOutID string
   * @param amount BigNumber
   * @param maxAdditionalSlippage number?
   * @see zilswap-sdk documentation
   * 
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
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
    const observedTx = await swapFunction(
      props.tokenInID,
      props.tokenOutID,
      props.amount.toString(),
      props.maxAdditionalSlippage);
    handleObservedTx(observedTx);

    return observedTx;
  };

  /**
   * Cleanup connections and disconnect from network.
   * May take awhile to disconnect due to `zilswap-sdk` tear down call.
   * 
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static disconnect = async (): Promise<void> => {
    const { zilswap } = getState();
    ZilswapConnector.network = undefined;
    await zilswap.teardown();
  };
}