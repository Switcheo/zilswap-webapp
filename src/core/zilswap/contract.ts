
export interface SimpleRPCRequest<T = any> {
  id?: string;
  jsonrpc?: string;
  method?: string;
  address: string;
  substate: string;
  resultAs?: string;
  indices?: string[];
  handler?: (result: any, accum: T, index: number, request: RPCRequest<T>) => T | Promise<T>
}

export interface RPCRequest<T = any> {
  id: string;
  jsonrpc: string;
  method: string;
  params: any[];
  resultKey: string;
  handler?: (result: any, accum: T, index: number, request: RPCRequest<T>) => T | Promise<T>
}

const defaultHandler = <T = any>(result: any, accum: T, index: number, request: RPCRequest<T>): T => {
  const substate = request.params[1];
  (accum as any)[request.resultKey] = result?.[substate];
  return accum;
}

export const mapRequest = <T = any>(request: SimpleRPCRequest<T>): RPCRequest<T> => {
  return {
    id: request.id ?? "42",
    jsonrpc: request.jsonrpc ?? "2.0",
    method: request.method ?? "GetSmartContractSubState",
    params: [request.address, request.substate, request.indices ?? []],
    handler: request.handler,

    resultKey: request.resultAs ?? request.substate,
  }
};

export const batchQuery = async  <T = any>(requests: SimpleRPCRequest<T>[], url: string) => {
  return sendBatchQuery(requests.map(mapRequest), url);
};

export const sendBatchQuery = async <T = any>(requests: RPCRequest<T>[], url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requests),
  });

  const results = await response.json();

  if (!Array.isArray(results)) {
    console.error(results);
    throw new Error("batch request failed")
  }

  let finalResult: T = {} as any;
  for (const index in results) {
    const result = results[index]?.result;
    const handler = requests[index].handler ?? defaultHandler;
    finalResult = await handler(result, finalResult, parseInt(index), requests[index]);
  }

  return finalResult;
}
