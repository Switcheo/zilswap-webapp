import { setZilliqa, getZilliqa } from "core/zilliqa";
import { fromBech32Address } from "@zilliqa-js/crypto"
import { Zilswap } from "zilswap-sdk";
import { Network, TOKENS } from 'zilswap-sdk/lib/constants';
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { MoonletConnectedWallet } from "./MoonletConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";
import { listTransactions, getBalance } from "core/services/viewblockService";
import { dapp } from "dapp-wallet-util";
import TokenService from "../token";
import { BigNumber } from "bignumber.js";
import { actions } from "app/store";
import { Dispatch } from "redux";


export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
  let moonlet = await dapp.getWalletInstance('moonlet');
  // @ts-ignore
  let account = await moonlet.providers.zilliqa.getAccounts();
  if (account.length < 1) return null;
  // @ts-ignore
  const moonletZil = new Zilswap(Network.TestNet, moonlet.providers.zilliqa);
  // @ts-ignore
  const network = moonlet.providers.zilliqa.currentNetwork.mainNet ? "mainnet" : "testnet";
  const accinfo = await getBalance({ network, address: account[0].address });
  const transactions = await listTransactions({ address: account[0].address, network });
  const balance = accinfo[0].balance;
  const timestamp = moment();
  const wallet = new MoonletConnectedWallet(account[0], balance, timestamp, transactions);
  setZilliqa(moonletZil);
  return { wallet };
}

export const connectWalletPrivateKey = async (inputPrivateKey: string, dispatch: Dispatch): Promise<ConnectWalletResult> => {
  const zilswap = new Zilswap(Network.TestNet, inputPrivateKey);
  setZilliqa(zilswap);
  //@ts-ignore
  let { zilliqa } = zilswap;
  await zilliqa.wallet.addByPrivateKey(inputPrivateKey);
  const account = zilliqa.wallet.defaultAccount!;
  await TokenService.getAllBalances(dispatch);

  const accinfo = await getBalance({ address: account.address });
  const transactions = await listTransactions({ address: account.address });
  const balance = accinfo[0].balance;
  const timestamp = moment();
  const wallet = new PrivateKeyConnectedWallet(account, balance, timestamp, transactions);
  console.log({ wallet });
  setZilliqa(zilswap);
  // const fungible_token_address = toBech32Address("509ae6e5d91cee3c6571dcd04aa08288a29d563a");
  // await LiquidityService.removeLiquidity({ tokenId: "ITN", contributionAmount: "4" });
  // const receipt = await LiquidityService.addLiquidity({ tokenId: fungible_token_address, tokenAmount: "1", zilAmount: "1" });
  // console.log({ receipt });
  return { wallet };
}