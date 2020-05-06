import { zilliqa } from "core/zilliqa";
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";
import { dapp } from "dapp-wallet-util";

export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
  let moonlet = await dapp.getWalletInstance('moonlet');
  // @ts-ignore
  let account = await moonlet.providers.zilliqa.getAccounts();
  console.log({ moonlet }, { account });
  return {};
}

export const connectWalletPrivateKey = async (inputPrivateKey: string): Promise<ConnectWalletResult> => {
  await zilliqa.wallet.addByPrivateKey(inputPrivateKey);

  const account = zilliqa.wallet.defaultAccount!;
  const balanceResult = await zilliqa.blockchain.getBalance(account.address);
  const balance = balanceResult.result.balance;
  const timestamp = moment();

  const wallet = new PrivateKeyConnectedWallet(account, balance, timestamp);

  return { wallet };
}
