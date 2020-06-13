import { Account } from "@zilliqa-js/account";
import { RPCResponse } from "@zilliqa-js/core";
import { BN, validation } from "@zilliqa-js/util";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { RPCHandler } from "core/utilities";
import moment from "moment";
import { APIS, Network } from 'zilswap-sdk/lib/constants';
import { ConnectWalletResult } from "./ConnectedWallet";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";

export const connectWalletPrivateKey = async (inputPrivateKey: string, network: Network = Network.TestNet): Promise<ConnectWalletResult> => {

  if (!validation.isPrivateKey(inputPrivateKey))
    throw new Error("Invalid private key");

  const zilliqa = new Zilliqa(APIS[network]);
  const address: string = zilliqa.wallet.addByPrivateKey(inputPrivateKey);
  const account: Account = zilliqa.wallet.defaultAccount!;
  const timestamp = moment();

  const balanceRPCResponse = await zilliqa.blockchain.getBalance(address);

  let balanceResult = null;

  try {
    // force cast required due to dependency resolution conflict
    balanceResult = RPCHandler.parseResponse(balanceRPCResponse as RPCResponse<any, string>);
  } catch (error) {
    // bypass error for addresses without any TXs.
    if (error.message !== "Account is not created")
      throw error;
    balanceResult = {
      balance: 0,
    };
  }

  const wallet = new PrivateKeyConnectedWallet(account, {
    network, timestamp, balance: new BN(balanceResult.balance),
  });

  return { wallet };
};