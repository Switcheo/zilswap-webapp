import { Currency, CurrencySymbol, CurrencyType } from "core/currency";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import * as ZilCrypto from "@zilliqa-js/crypto";
// @ts-ignore
import { BN, Long, bytes, units  } from "@zilliqa-js/util";

const zilliqa = new Zilliqa('https://dev-api.zilliqa.com/');
// mainnet, it is 65537.
const chainId = 333; // chainId of the developer testnet
const msgVersion = 1; // current msgVersion
const VERSION = bytes.pack(chainId, msgVersion);

export enum WalletConnectType {
  Moonlet, PrivateKey
}

export type ConnectedWallet = {
  type: WalletConnectType;
  getDetail: () => any;
  getBalance: () => any;
  createTransaction: (tx_data: TxRequestProps) => Promise<TxResult>;
  getTransaction: (txHash: string) => any;
  removeWallet: (address: string) => void;
  getAllWallets: () => any;
  // ...
}

export type ConnectWalletResult = {
  wallet?: ConnectedWallet;
  // ...
}

export interface TxRequestProps {
  toAddr: string;
  amount: number;
  gasPrice: number;
  gasLimit?: number;
  code?: string;
  data?: string;
}

export interface SwapProps {
  giveCurrency: Currency;
  giveAmount?: number;
  receiveCurrency: Currency;
}

export interface TxResult {
  // ...
}

export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
  return {};
}

export const connectWalletPrivateKey = async (privateKey: string): Promise<ConnectWalletResult> => {
  await zilliqa.wallet.addByPrivateKey(privateKey);
  const { blockchain, wallet, transactions } = zilliqa;
  const { accounts, defaultAccount  } = wallet;

  const connected_wallet: ConnectedWallet = { 
    type: WalletConnectType.PrivateKey, 
    getDetail: () => {
      return defaultAccount;
    },
    getBalance: async () => {
      return await blockchain.getBalance(ZilCrypto.getAddressFromPrivateKey(privateKey));
    },
    createTransaction: async (tx_data: TxRequestProps):  Promise<TxResult> => {
      const { toAddr, gasLimit, gasPrice, amount } = tx_data;
      const generatedTxObject = transactions.new({
        version: VERSION,
        toAddr,
        // @ts-ignore
        amount: new BN(units.toQa(amount, units.Units.Zil)),
        // @ts-ignore
        gasLimit: Long.fromNumber(gasLimit | 1),
        // @ts-ignore
        gasPrice: units.toQa(gasPrice, units.Units.Li), 
      }, false)
      const txResult = await blockchain.createTransaction(generatedTxObject);
      return txResult;
    },
    getTransaction: async (txHash: string) => {
      return await blockchain.getTransaction(txHash);
    },
    removeWallet: (address) => {
      wallet.remove(address);
    },
    getAllWallets: (): any => {
      return accounts;
    },
  };
  return <ConnectWalletResult>{wallet: connected_wallet};
}
