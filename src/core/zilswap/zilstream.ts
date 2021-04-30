import { HTTP } from "core/utilities";

export interface ZilStreamRates {
  time: string
  value: number
  low: number
  high: number
  open: number
  close: number
  token_id: number
}

export interface TimeFilter {
  interval: string,
  period: string,
}

const ZILSTREAM_URL = "https://api.zilstream.com";

export const getZilStreamTokenRates = async (symbol: string, timeFilter?: TimeFilter): Promise<ZilStreamRates[]> => {
  const http = new HTTP(ZILSTREAM_URL, {
    "tokenrate": "/rates/:token"
  });
  const url = http.path("tokenrate", { token: symbol }, { ...timeFilter });
  const result = await http.get({ url });

  return result.json();
}