import { Account } from "@zilliqa-js/account";
import { RPCResponse } from "@zilliqa-js/core";
import { validation } from "@zilliqa-js/util";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { RPCHandler } from "core/utilities";
import moment from "moment";
import { WalletProvider } from "zilswap-sdk";
import { APIS, Network } from 'zilswap-sdk/lib/constants';
import { ConnectWalletResult } from "./ConnectedWallet";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";
import { ZilPayConnectedWallet } from "./ZilPayConnectedWallet";
import { DefaultFallbackNetwork, ZilPayNetworkMap } from "app/utils/contants";

export const parseBalanceResponse = (balanceRPCResponse: RPCResponse<any, string>) => {
  let balanceResult = null;
  try {
    // force cast required due to dependency resolution conflict
    balanceResult = RPCHandler.parseResponse(balanceRPCResponse);
  } catch (error) {
    // bypass error for addresses without any TXs.
    if (error.message !== "Account is not created")
      throw error;
    balanceResult = {
      balance: 0,
    };
  }

  return balanceResult;
}

export const connectWalletPrivateKey = async (inputPrivateKey: string, network: Network = DefaultFallbackNetwork): Promise<ConnectWalletResult> => {

  if (!validation.isPrivateKey(inputPrivateKey))
    throw new Error("Invalid private key");

  const zilliqa = new Zilliqa(APIS[network]);
  zilliqa.wallet.addByPrivateKey(inputPrivateKey);
  const account: Account = zilliqa.wallet.defaultAccount!;
  const timestamp = moment();

  const wallet = new PrivateKeyConnectedWallet(account, {
    network, timestamp,
  });

  return { wallet };
};

export const connectWalletZilPay = async (zilPay: any): Promise<ConnectWalletResult> => {

  if (!zilPay.wallet.isConnect)
    throw new Error("ZilPay not connected.");

  const account: any = zilPay.wallet.defaultAccount;
  if (!account)
    throw new Error("Please sign in to your ZilPay account before connecting.");
  const timestamp = moment();

  const net = zilPay.wallet.net;
  const network = ZilPayNetworkMap[net];
  if (!network)
    throw new Error(`Unsupported ZilPay network: ${net}`);

  const wallet = new ZilPayConnectedWallet({
    network, timestamp,
    zilpay: zilPay as WalletProvider,
    bech32: account!.bech32,
    base16: account!.base16,
  });

  return { wallet };
};
