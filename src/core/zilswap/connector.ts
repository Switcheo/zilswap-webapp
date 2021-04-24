import { fromBech32Address } from "@zilliqa-js/crypto";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { BIG_ZERO, DefaultFallbackNetwork } from "app/utils/constants";
import BigNumber from "bignumber.js";
import { logger } from "core/utilities";
import { ConnectedWallet, WalletConnectType } from "core/wallet/ConnectedWallet";
import { ObservedTx, OnUpdate, Pool, TokenDetails, TxReceipt, TxStatus, WalletProvider, Zilswap } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import { RPCEndpoints } from "app/utils/constants";
import { getAllowancesMap, getBalancesMap } from "./utils";

export interface ConnectProps {
  wallet: ConnectedWallet;
  network: Network;
  observedTxs?: ObservedTx[];
};
export interface InitProps {
  network?: Network;
};

interface ConnectorCallProps {
  suppressLogs?: boolean;
};

export interface ExchangeRateQueryProps extends ConnectorCallProps {
  exactOf: "in" | "out";
  tokenInID: string;
  tokenOutID: string;
  amount: BigNumber;
};

export interface ApproveTxProps {
  tokenID: string;
  tokenAmount: BigNumber;
};

export interface ChangeNetworkProps {
  network: Network;
};

export interface AddTokenProps {
  address: string;
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
  recipientAddress?: string;
};

export interface TokenContractBalancesState {
  [index: string]: string;
}

export interface TokenContractAllowancesState {
  [index: string]: TokenContractBalancesState;
}

type ConnectorState = {
  zilswap: Zilswap;
  wallet?: ConnectedWallet;
};
type StateUpdateProps = {
  network: Network;
  wallet?: ConnectedWallet;
  observedTxs?: ObservedTx[];
  providerOrKey?: WalletProvider | string;
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

  static connectorState: ConnectorState;

  private static mainObserver: OnUpdate = (tx: ObservedTx, status: TxStatus, receipt?: TxReceipt) => {
    logger("main observer", tx.hash, status);
    try {
      if (ZilswapConnector.observer)
        ZilswapConnector.observer(tx, status, receipt);
    } catch (e) {
      logger("error processing observeTx update", e);
    }
  };

  /**
   * Constructor for Zilswap SDK wrapper. Must populate connectorState.wallet if executed,
   * throws error otherwise.
   *
   * @param wallet `ConnectedWallet` instance to provide blockchain connection interface.
   * @returns Promise<Zilswap> Zilswap instance initialized with wallet properties (network and provider).
   * @throws "moonlet support under development" when providing MoonletConnectedWallet.
   * @throws "unknown wallet connector" when wallet type unknown.
   */
  private static initializeForWallet = async (props: ConnectProps): Promise<void> => {
    const { wallet, observedTxs, network } = props;
    switch (wallet.type) {
      case WalletConnectType.PrivateKey:
        await ZilswapConnector.setState({
          network,
          wallet, observedTxs,
          providerOrKey: wallet.provider,
        });
        return;
      case WalletConnectType.Zeeves:
        await ZilswapConnector.setState({
          network,
          wallet, observedTxs,
          providerOrKey: wallet.provider,
        });
        return;
      case WalletConnectType.Moonlet:
        throw new Error("moonlet support under development");
      case WalletConnectType.ZilPay:
        await ZilswapConnector.setState({
          network,
          wallet, observedTxs,
          providerOrKey: wallet.provider,
        });
        return;
      default:
        throw new Error("unknown wallet connector");
    }
  };

  private static getState = (connected: boolean = false): ConnectorState => {
    if (connected && !ZilswapConnector.connectorState?.wallet)
      throw new Error("not connected");
    if (!ZilswapConnector.connectorState)
      throw new Error("not intialised");
    return ZilswapConnector.connectorState!;
  };

  private static setState = async (props: StateUpdateProps) => {
    const { wallet, network, providerOrKey } = props;
    const zilswap = new Zilswap(network, providerOrKey, { rpcEndpoint: RPCEndpoints[network] });

    await ZilswapConnector.connectorState?.zilswap.teardown();

    const observedTxs = props.observedTxs || [];
    await zilswap.initialize(ZilswapConnector.mainObserver, observedTxs)
    ZilswapConnector.connectorState = { zilswap, wallet };
    ZilswapConnector.network = network;
    logger("zilswap sdk initialised");
  };


  /**
   *
   *
   */
  static registerObserver = (observer: OnUpdate | null) => {
    logger("connector register observer");
    ZilswapConnector.observer = observer;
  };

  static initialise = async (props: InitProps = {}) => {
    const { network = ZilswapConnector.network || DefaultFallbackNetwork } = props;

    await ZilswapConnector.setState({ network });
    logger("zilswap connection established");
  };

  /**
   *
   */
  static connect = async (props: ConnectProps) => {
    await ZilswapConnector.initializeForWallet(props);
    logger("zilswap connection established");
  };

  /**
   * Get a fresh instance of Zilliqa with the connector's network.
   *
   * @returns Zilliqa instance
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getZilliqa = () => {
    const { zilswap } = ZilswapConnector.getState();
    return new Zilliqa(RPCEndpoints[zilswap.network]);
  };

  /**
   * Get the app state of the Zilswap SDK.
   *
   * @returns the app state
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getZilswapState = () => {
    const { zilswap } = ZilswapConnector.getState();
    return zilswap.getAppState();
  };

  static getToken = (tokenID: string): TokenDetails | undefined => {
    const { zilswap } = ZilswapConnector.getState();
    const { tokens } = zilswap.getAppState();

    return Object.values(tokens).find((token) => token.address === tokenID);
  }

  /**
   * Get list of tokens found in the Zilswap SDK app state.
   *
   * @returns array of tokens in Zilswap SDK's TokenDetails representation.
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getTokens = (): TokenDetails[] => {
    const { zilswap } = ZilswapConnector.getState();
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
    const { zilswap } = ZilswapConnector.getState();
    return zilswap.getPool(tokenID);
  };

  /**
   *
   *
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getGasLimit = (): BigNumber => {
    const { zilswap } = ZilswapConnector.getState();
    return new BigNumber(zilswap._txParams.gasLimit.toString());
  };

  static loadBalanceState = async (tokenID: string): Promise<TokenContractBalancesState | undefined> => {
    const token = ZilswapConnector.getToken(tokenID);
    if (!token) {
      return
    }

    const contractBalancesState = await getBalancesMap(token.contract);
    return contractBalancesState as TokenContractBalancesState | undefined
  }

  static loadAllowances = async (tokenID: string): Promise<TokenContractAllowancesState | undefined> => {
    const token = ZilswapConnector.getToken(tokenID);
    if (!token) {
      return
    }

    const contractAllowancesState = await getAllowancesMap(token.contract);
    return contractAllowancesState as TokenContractAllowancesState | undefined
  }

  /**
   *
   *
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static adjustedForGas = (intendedAmount: BigNumber, balance?: BigNumber): BigNumber => {
    if (!balance) balance = new BigNumber(intendedAmount);
    const gasLimit = ZilswapConnector.getGasLimit();
    const netGasAmount = BigNumber.min(BigNumber.max(balance.minus(gasLimit), BIG_ZERO), intendedAmount);
    return netGasAmount;
  };

  /**
   * change network for Zilswap SDK
   *
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static changeNetwork = async (props: ChangeNetworkProps) => {
    const { wallet } = ZilswapConnector.getState();

    logger(props.network);

    if (wallet) {
      await ZilswapConnector.connect({
        network: props.network,
        wallet: { ...wallet, network: props.network },
      });
    } else {
      await ZilswapConnector.initialise({
        network: props.network,
      });
    }
  };

  /**
   *
   *
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static setDeadlineBlocks = (blocks: number) => {
    const { zilswap } = ZilswapConnector.getState();
    return zilswap.setDeadlineBlocks(blocks);
  };

  /**
   *
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static approveTokenTransfer = async (props: ApproveTxProps) => {
    const { zilswap } = ZilswapConnector.getState(true);

    logger(props.tokenID);
    logger(props.tokenAmount.toString());
    const observedTx = await zilswap.approveTokenTransferIfRequired(props.tokenID, props.tokenAmount);
    if (observedTx)
      handleObservedTx(observedTx);

    return observedTx;
  };

  /**
   *
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static addPoolToken = async (props: AddTokenProps) => {
    const { zilswap } = ZilswapConnector.getState(true);

    const tokenExists = await zilswap.addToken(props.address);
    if (!tokenExists)
      throw new Error("token not found");
    const { tokens } = zilswap.getAppState();
    const byte20Address = fromBech32Address(props.address);
    return tokens[byte20Address.toLowerCase()];
  };

  /**
   *
   *
   * @throws "not connected" if `ZilswapConnector.connect` not called.
   */
  static getExchangeRate = (props: ExchangeRateQueryProps) => {
    const { zilswap } = ZilswapConnector.getState();
    const queryFunction = props.exactOf === "in" ?
      zilswap.getRatesForInput.bind(zilswap) : zilswap.getRatesForOutput.bind(zilswap);

    if (!props.suppressLogs) {
      logger(props.exactOf);
      logger(props.tokenInID);
      logger(props.tokenOutID);
      logger(props.amount.toString());
    }
    return queryFunction(
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
    const { zilswap } = ZilswapConnector.getState(true);

    logger(props.tokenID);
    logger(props.zilAmount.toString());
    logger(props.tokenAmount.toString());
    logger(props.maxExchangeRateChange);
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
    const { zilswap } = ZilswapConnector.getState(true);

    logger(props.tokenID);
    logger(props.contributionAmount.toString());
    logger(props.maxExchangeRateChange);
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
    const { zilswap } = ZilswapConnector.getState(true);

    const swapFunction = props.exactOf === "in" ?
      zilswap.swapWithExactInput.bind(zilswap) :
      zilswap.swapWithExactOutput.bind(zilswap);

    logger(props.exactOf);
    logger(props.tokenInID);
    logger(props.tokenOutID);
    logger(props.amount.toString());
    logger(props.maxAdditionalSlippage);
    logger(props.recipientAddress);
    const observedTx = await swapFunction(
      props.tokenInID,
      props.tokenOutID,
      props.amount.toString(),
      props.maxAdditionalSlippage,
      props.recipientAddress);
    handleObservedTx(observedTx);

    return observedTx;
  };
}
