import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import { HTTP } from "./http";

export const PATH_PREFIX = "https://api.coingecko.com/api/v3";

const PATHS = {
	getPrice: "/simple/price?ids=:coins&vs_currencies=:quote",
};

const http = new HTTP(PATH_PREFIX, PATHS);

export interface CoinGeckoPriceResult {
	[index: string]: BigNumber;
};

interface GetPriceProps {
	coins: string[];
	quote: string;
};

/**
 * CoinGecko API abstraction object
 */
export class CoinGecko {

	/**
	 * Static function to query Contract Events from CoinGecko given a contact address and event name.
	 * 
	 * @param address address to query.
	 * @param network mainnet | testnet - defaults to `testnet`
	 * @param event event types to query.
	 * @param page page number for pagination.
	 * @returns response in JSON representation
	 */
	static getPrice = async ({ coins, quote }: GetPriceProps): Promise<CoinGeckoPriceResult> => {
		const url = http.path("getPrice", { coins: coins.join(","), quote });
		const response = await http.get({ url });
		const result = await response.json();

		return Object.keys(result).reduce((accum, coin) => {
			accum[coin] = bnOrZero(result[coin][quote]);
			return accum;
		}, {} as CoinGeckoPriceResult)
	}
}
