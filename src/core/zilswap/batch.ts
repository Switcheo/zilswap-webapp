import { TokenInfo } from "app/store/types";
import { Network } from "zilswap-sdk/lib/constants";
import { ZilswapConnector } from "./connector";

interface BatchRequestItem {
  id: string;
  jsonrpc: string;
  method: string;
  params: any[];
}

interface BatchRequest {
  type: string
  token: TokenInfo
  item: BatchRequestItem
}

interface BatchResponse {
  request: BatchRequest;
  result: any;
}

export const balanceBatchRequest = (token: TokenInfo, address: string): BatchRequest => {
  return {
    type: 'balance',
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetBalance",
      params: [address],
    },
  };
}

export const tokenBalanceBatchRequest = (token: TokenInfo, walletAddress: string): BatchRequest => {
  const contract = ZilswapConnector.getToken(token.address)!.contract;
  return {
    type: 'tokenBalance',
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractSubState",
      params: [
        contract.address!.replace("0x", "").toLowerCase(),
        "balances",
        [walletAddress],
      ],
    },
  };
}

export const tokenAllowancesBatchRequest = (token: TokenInfo, walletAddress: string): BatchRequest => {
  const contract = ZilswapConnector.getToken(token.address)!.contract;
  return {
    type: 'tokenAllowance',
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractSubState",
      params: [
        contract.address!.replace("0x", "").toLowerCase(),
        "allowances",
        [walletAddress],
      ],
    },
  };
}

export const sendBatchRequest = async (network: Network, requests: BatchRequest[]): Promise<BatchResponse[]> => {
  var baseUrl = "https://api.zilliqa.com/"
  if(network == Network.TestNet) {
    baseUrl = "https://dev-api.zilliqa.com/"
  }
  const res = await fetch(baseUrl, {
    method: "POST",
    body: JSON.stringify(requests.flatMap(request => request.item)),
  });

  const results = await res.json();

  if(!Array.isArray(results)) {
    return []
  }

  var responseItems: BatchResponse[] = [];
  results.forEach((result: any, i: number) => {
    responseItems.push({
      request: requests[i],
      result: result.result,
    });
  });

  return responseItems;
};
