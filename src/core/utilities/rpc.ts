import { RPCResponse } from "@zilliqa-js/core";

export class RPCResultError extends Error {
  rpcResponse?: RPCResponse<any, string>;
  constructor(message?: string, response?: RPCResponse<any, string>) {
    super(message);
    this.rpcResponse = response;
  }
};

export class RPCHandler {
  /**
   * Static helper method to parse Zilliqa RPC response.
   * 
   * @throws {@link RPCResultError} if `response` is not an object, or if `response.error` is truthy.
   * @param response RPCResponse object returned when executing blockchain transaction with `@zilliqa-js` SDK.
   * @returns RPCResponse.result
   */
  static parseResponse = (response: RPCResponse<any, string>): any => {
    if (typeof response !== "object")
      throw new RPCResultError("cannot parse RPC response", response);

    if (response.error)
      throw new RPCResultError(response.error.message, response);
    if (response.result)
      return response.result;
  };
};