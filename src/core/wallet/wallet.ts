import { setZilliqa, ZilUrl } from "core/zilliqa";
import { fromBech32Address } from "@zilliqa-js/crypto"
import { Zilswap } from "zilswap-sdk";
import { Network, TOKENS } from 'zilswap-sdk/lib/constants';
import moment from "moment";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { MoonletConnectedWallet } from "./MoonletConnectedWallet";
import { ConnectWalletResult } from "./ConnectedWallet";
import { listTransactions, getBalance } from "core/services/viewblockService";
import { dapp } from "dapp-wallet-util";
import { getZilliqa } from "core/zilliqa";

import LiquidityService from "../liquidity";
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

  await getBalancesMap(dispatch, account.address);

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

export const getPool = async (dispatch: Dispatch) => {
  const zilliqa = getZilliqa();
  await zilliqa.initialize();
  console.log(zilliqa)
  const pool = await zilliqa.getPool("ITN");
  let { contributionPercentage, exchangeRate, tokenReserve, totalContribution, userContribution, zilReserve } = pool;

  console.log("contributionPercentage", new BigNumber(contributionPercentage).toString());
  console.log("exchangeRate", new BigNumber(exchangeRate).toString());
  console.log("tokenReserve", new BigNumber(tokenReserve).toString());
  console.log("totalContribution", new BigNumber(totalContribution).toString());
  console.log("userContribution", new BigNumber(userContribution).toString());
  console.log("zilReserve", new BigNumber(zilReserve).toString());

  contributionPercentage = new BigNumber(contributionPercentage).toString();
  exchangeRate = new BigNumber(exchangeRate).toFixed(5).toString();
  tokenReserve = new BigNumber(tokenReserve).toString();
  totalContribution = new BigNumber(totalContribution).shiftedBy(-12).toString();
  userContribution = new BigNumber(userContribution).toString();
  zilReserve = new BigNumber(zilReserve).toString();

  dispatch(actions.Pool.update_pool({ contributionPercentage, exchangeRate, tokenReserve, totalContribution, userContribution, zilReserve }));
  await zilliqa.teardown();
}

export const getBalancesMap = async (dispatch: Dispatch, account_addr: string) => {
  const tok_addr = TOKENS.TestNet[Network.TestNet];
  const zilswap = getZilliqa();
  let { zilliqa } = zilswap;
  //@ts-ignore
  let contract = await zilliqa.contracts.at("zil18zlr57uhrmnk4mfkuawgv0un295k970a9s3lnq");
  let { balances_map } = await contract.getSubState("balances_map");

  if (balances_map) {
    let balance = balances_map[account_addr.toLowerCase()];
    dispatch(actions.Wallet.update_currency_balance({ currency: "ITN", balance }));

    console.log(account_addr, { balances_map }, balance, account_addr);
  }
}