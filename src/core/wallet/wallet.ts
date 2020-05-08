import { setZilliqa, ZilUrl } from "core/zilliqa";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { MoonletConnectedWallet } from "./MoonletConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";
import { listTransations } from "core/services/TransactionSrv";
import { dapp } from "dapp-wallet-util";

export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
  let moonlet = await dapp.getWalletInstance('moonlet');
  // @ts-ignore
  let account = await moonlet.providers.zilliqa.getAccounts();
  console.log({ moonlet }, { account });
  if (account.length < 1) return {};
  try {
    // @ts-ignore
    const moonletZil = new Zilliqa(moonlet.providers.zilliqa.currentNetwork.url, moonlet.providers.zilliqa);
    const transactions = await listTransations({ address: account[0].address });
    const balanceResult = await moonletZil.blockchain.getBalance(account[0].address);
    const balance = balanceResult.result.balance;
    const timestamp = moment();
    // @ts-ignore
    const wallet = new MoonletConnectedWallet(account, balance, timestamp, moonletZil, transactions);
    setZilliqa(moonletZil);
    return { wallet };
  } catch (error) {
    console.error(error);
    return {};
  }
}

export const connectWalletPrivateKey = async (inputPrivateKey: string): Promise<ConnectWalletResult> => {
  const zilliqa = new Zilliqa(ZilUrl);
  await zilliqa.wallet.addByPrivateKey(inputPrivateKey);

  const account = zilliqa.wallet.defaultAccount!;
  const balanceResult = await zilliqa.blockchain.getBalance(account.address);
  const transactions = await listTransations({ address: account.address });
  const balance = balanceResult.result.balance;
  const timestamp = moment();

  const wallet = new PrivateKeyConnectedWallet(account, balance, timestamp, transactions);
  setZilliqa(zilliqa);
  return { wallet };
}
