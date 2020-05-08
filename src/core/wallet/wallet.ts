import { setZilliqa } from "core/zilliqa";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { MoonletConnectedWallet } from "./MoonletConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";
// import { listTransations } from "core/services/TransactionSrv";
import { dapp } from "dapp-wallet-util";

export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
  let moonlet = await dapp.getWalletInstance('moonlet');
  // @ts-ignore
  let account = await moonlet.providers.zilliqa.getAccounts();
  console.log({ moonlet }, { account });
  if (account.length < 1) return {};
  try {
    // @ts-ignore
    // const moonletZil = new Zilliqa('', moonlet.providers.zilliqa);
    const moonletZil = new Zilliqa('https://dev-api.zilliqa.com/');
    // const transactions = await listTransations({ address: "zil1ct5rnjt7et0fq7y6emnq4y8fn4euss8977llses" });

    // moonletZil.blockchain.signer = moonletZil.contracts.signer = {
    //   sign: m => m
    // };

    console.log({ moonletZil })
    const balanceResult = await moonletZil.blockchain.getBalance(account[0].address);
    console.log({ balanceResult })
    const balance = balanceResult.result.balance;
    const timestamp = moment();
    const wallet = new MoonletConnectedWallet(account, balance, timestamp, moonletZil);
    setZilliqa(moonletZil);
    return {};
  } catch (error) {
    console.error(error);
    return {};
  }
}

export const connectWalletPrivateKey = async (inputPrivateKey: string): Promise<ConnectWalletResult> => {
  const zilliqa = new Zilliqa('https://dev-api.zilliqa.com/');
  await zilliqa.wallet.addByPrivateKey(inputPrivateKey);

  const account = zilliqa.wallet.defaultAccount!;
  const balanceResult = await zilliqa.blockchain.getBalance(account.address);
  const balance = balanceResult.result.balance;
  const timestamp = moment();

  const wallet = new PrivateKeyConnectedWallet(account, balance, timestamp);
  setZilliqa(zilliqa);
  return { wallet };
}
