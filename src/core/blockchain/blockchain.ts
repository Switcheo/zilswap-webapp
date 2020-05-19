import { Transaction } from "@zilliqa-js/account";
import { BN, Long, units } from "@zilliqa-js/util";
import { VERSION, getZilliqa, ZilUnits } from "core/zilliqa";
import { Currency } from "core/currency";

export interface TxRequestProps {
  toAddr: string;
  amount: number;
  gasPrice: number;
  gasLimit: number;
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

export const getTransaction = async (txHash: string): Promise<Transaction> => {
  const { zilliqa } = getZilliqa();
  if (!zilliqa) Promise.reject("no wallet");
  return await zilliqa.blockchain.getTransaction(txHash);
};
export const createTransaction = async (txRequest: TxRequestProps): Promise<Transaction> => {
  const { zilliqa } = getZilliqa();
  if (!zilliqa) Promise.reject("no wallet");
  const { toAddr, gasLimit, gasPrice, amount } = txRequest;
  // Without this bypass create transaction wont work
  // apply a hack to disable internal ZilliqaJS autosigning feature
  zilliqa.blockchain.signer = zilliqa.contracts.signer = {
    // @ts-ignore
    sign: m => m
  };
  const generatedTxObject = await zilliqa.transactions.new({
    version: VERSION,
    toAddr,
    amount: new BN(units.toQa(amount, ZilUnits.Zil)),
    gasLimit: Long.fromNumber(gasLimit),
    gasPrice: units.toQa(gasPrice, ZilUnits.Li),
  }, false)
  const txResult = await zilliqa.blockchain.createTransaction(generatedTxObject);
  return txResult;
};