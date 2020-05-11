import { setZilliqa, ZilUrl } from "core/zilliqa";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { MoonletConnectedWallet } from "./MoonletConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";
import { listTransactions, getBalance } from "core/services/viewblockService";
import { dapp } from "dapp-wallet-util";

export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
  let moonlet = await dapp.getWalletInstance('moonlet');
  // @ts-ignore
  let account = await moonlet.providers.zilliqa.getAccounts();
  if (account.length < 1) return null;
  try {
    // @ts-ignore
    const moonletZil = new Zilliqa(moonlet.providers.zilliqa.currentNetwork.url, moonlet.providers.zilliqa);
    // @ts-ignore
    const network = moonlet.providers.zilliqa.currentNetwork.mainNet ? "mainnet" : "testnet"
    // const balanceResult = await moonletZil.blockchain.getBalance(account[0].address);
    const accinfo = await getBalance({ network, address: account[0].address });
    const transactions = await listTransactions({ address: account[0].address, network });
    // @ts-ignore
    const balance = accinfo[0].balance;
    const timestamp = moment();
    // @ts-ignore
    const wallet = new MoonletConnectedWallet(account[0], balance, timestamp, transactions);
    setZilliqa(moonletZil);
    return { wallet };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const connectWalletPrivateKey = async (inputPrivateKey: string): Promise<ConnectWalletResult> => {
  const zilliqa = new Zilliqa(ZilUrl);
  await zilliqa.wallet.addByPrivateKey(inputPrivateKey);

  const account = zilliqa.wallet.defaultAccount!;
  // const balanceResult = await zilliqa.blockchain.getBalance(account.address);
  const accinfo = await getBalance({ address: account.address });
  const transactions = await listTransactions({ address: account.address });
  // @ts-ignore
  const balance = accinfo[0].balance;
  const timestamp = moment();
  const wallet = new PrivateKeyConnectedWallet(account, balance, timestamp, transactions);
  setZilliqa(zilliqa);
  return { wallet };
}
