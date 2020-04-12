import { zilliqa } from "core/zilliqa";
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";

export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
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
