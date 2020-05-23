import { Account } from "@zilliqa-js/account";
import { RPCResponse } from "@zilliqa-js/core";
import { BN } from "@zilliqa-js/util";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { RPCHandler } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import moment from "moment";
import { Network, APIS } from 'zilswap-sdk/lib/constants';
import { ConnectWalletResult } from "./ConnectedWallet";
import { PrivateKeyConnectedWallet } from "./PrivateKeyConnectedWallet";

export const connectWalletPrivateKey = async (inputPrivateKey: string, network: Network = Network.TestNet): Promise<ConnectWalletResult> => {
  const zilliqa = new Zilliqa(APIS[network]);
  const address: string = zilliqa.wallet.addByPrivateKey(inputPrivateKey);
  const account: Account = zilliqa.wallet.defaultAccount!;
  const timestamp = moment();

  const balanceRPCResponse = await zilliqa.blockchain.getBalance(address);

  // force cast required due to dependency resolution conflict
  const balanceResult = RPCHandler.parseResponse(balanceRPCResponse as RPCResponse<any, string>);

  console.log({ balanceResult });

  const wallet = new PrivateKeyConnectedWallet(account, {
    network, timestamp, balance: new BN(balanceResult.balance),
  });

  await ZilswapConnector.connect({ wallet, network });
  return { wallet };
};