import { RPCResponse } from "@zilliqa-js/core";


export class RPCResultError extends Error {
  rpcResponse?: RPCResponse<any, string>;
  constructor(message?: string, response?: RPCResponse<any, string>) {
    super(message);
    this.rpcResponse = response;
  }
};

export class RPCHandler {
  
  static parseResponse = (response: RPCResponse<any, string>): any => {
    if (typeof response !== "object")
      throw new RPCResultError("cannot parse RPC response", response)

    if (response.error)
      throw new RPCResultError(response.error.message, response);
    if (response.result)
      return response.result;
  };
};