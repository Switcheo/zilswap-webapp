import { setZilliqa, ZilUrl } from "core/zilliqa";
import { fromBech32Address } from "@zilliqa-js/crypto"
import { Zilswap } from "zilswap-sdk";
import { Network } from 'zilswap-sdk/lib/constants';
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { MoonletConnectedWallet } from "./MoonletConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";
import { listTransactions, getBalance } from "core/services/viewblockService";
import { dapp } from "dapp-wallet-util";

import LiquidityService from "../liquidity";


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

export const connectWalletPrivateKey = async (inputPrivateKey: string): Promise<ConnectWalletResult> => {
  const zilswap = new Zilswap(Network.TestNet, inputPrivateKey);
  // const tok_addr = "zil18zlr57uhrmnk4mfkuawgv0un295k970a9s3lnq";

  // //@ts-ignore
  // let contract = await zilswap.zilliqa.contracts.at("zil18zlr57uhrmnk4mfkuawgv0un295k970a9s3lnq");
  // //@ts-ignore
  // let balances_map = await contract.getSubState("balances_map");

  // console.log({ balances_map })

  //@ts-ignore
  // let state = await zilswap.zilliqa.contract.getSubState(
  //   fromBech32Address(tok_addr).replace(
  //     "0x",
  //     ""
  //   )
  // );

  // console.log({ state })

  //@ts-ignore
  let { zilliqa } = zilswap;
  await zilliqa.wallet.addByPrivateKey(inputPrivateKey);

  const account = zilliqa.wallet.defaultAccount!;
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
