
import { fromBech32Address } from "@zilliqa-js/crypto";
import { Network } from "zilswap-sdk/lib/constants";

import { HTTP } from "core/utilities";
import { TokenInfo } from "app/store/types";
import { RPCEndpoints } from "app/utils/constants";

export enum BatchRequestType {
  Balance = "balance",
  TokenBalance = "tokenBalance",
  TokenAllowance = "tokenAllowance"
};

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

/**
 * Create a `GetBalance` request.
 *
 * @param TokenInfo The token for which it's requested.
 * @param string The wallet address.
 * @returns BatchRequest
 */
export const balanceBatchRequest = (token: TokenInfo, address: string): BatchRequest => {
  return {
    type: BatchRequestType.Balance,
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetBalance",
      params: [address],
    },
  };
}

/**
 * Create a `GetSmartContractSubState` request for the balances variable.
 *
 * @param TokenInfo The token for which it's requested.
 * @param string The wallet address.
 * @returns BatchRequest
 */
export const tokenBalanceBatchRequest = (token: TokenInfo, walletAddress: string): BatchRequest => {
  return {
    type: BatchRequestType.TokenBalance,
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractSubState",
      params: [
        fromBech32Address(token.address).replace("0x", "").toLowerCase(),
        "balances",
        [walletAddress],
      ],
    },
  };
}

/**
 * Create a `GetSmartContractSubState` request for the allowances variable.
 *
 * @param TokenInfo The token for which it's requested.
 * @param string The wallet address.
 * @returns BatchRequest
 */
export const tokenAllowancesBatchRequest = (token: TokenInfo, walletAddress: string): BatchRequest => {
  return {
    type: BatchRequestType.TokenAllowance,
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractSubState",
      params: [
        fromBech32Address(token.address).replace("0x", "").toLowerCase(),
        "allowances",
        [walletAddress],
      ],
    },
  };
}

/**
 * Sends a series of requests as a batch to the Zilliqa API.
 *
 * @param Network The currently selected network.
 * @param BatchRequest[] An array of RPC requests.
 * @returns Promise<BatchResponse[]> Array of responses.
 */
// Zilliqa's public node meters each item of a JSON-RPC batch as its own call,
// so one array holding every token's balance lookup comes back as a wall of
// RPC_RATE_LIMIT errors. Send in paced chunks instead.
const BATCH_CHUNK_SIZE = 20;
const BATCH_CHUNK_DELAY_MS = 300;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendBatchRequest = async (network: Network, requests: BatchRequest[]): Promise<BatchResponse[]> => {
  // Share the single endpoint definition rather than repeating it — the old
  // hardcoded testnet host was retired by Zilliqa 2.0 and no longer resolves.
  const baseUrl = `${RPCEndpoints[network]}/`;

  const http = new HTTP(baseUrl, { '/': '/' });
  const url = http.path("/");

  const responseItems: BatchResponse[] = [];
  for (let offset = 0; offset < requests.length; offset += BATCH_CHUNK_SIZE) {
    if (offset > 0) await sleep(BATCH_CHUNK_DELAY_MS);
    const chunk = requests.slice(offset, offset + BATCH_CHUNK_SIZE);

    const response = await http.post({
      url,
      data: chunk.flatMap(request => request.item)
    })

    const results = await response.json();
    if (!Array.isArray(results)) continue;

    results.forEach((result: any, i: number) => {
      responseItems.push({
        request: chunk[i],
        result: result.result,
      });
    });
  }

  return responseItems;
};
