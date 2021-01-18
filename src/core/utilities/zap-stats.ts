import { Network } from "zilswap-sdk/lib/constants";
import { HTTP } from "./http";

const PATHS = {
	"liquidity/weighted": "/weighted_liquidity",
	"liquidity/changes": "/liquidity_changes",
	"liquidity": "/liquidity",
	"swaps": "/swaps",
};

const mainnetApi = new HTTP("https://stats.zilswap.org", PATHS);
const testnetApi = new HTTP("https://test-stats.zilswap.org", PATHS);

export interface QueryOptions {
	network?: Network;
}

export interface PaginationOptions {
	per_page?: number;
	page?: number;
}

export interface GetLiquidityOpts extends QueryOptions {
	timestamp?: number;
	address?: string;
}

export interface GetWeightedLiquidityOpts extends QueryOptions {
	timestamp?: number;
	address?: string;
}

export interface GetLiquidityChangesOpts extends PaginationOptions, QueryOptions {
	address?: string;
	pool?: string;
}

export interface GetSwapsOpts extends PaginationOptions, QueryOptions {
	address?: string;
	pool?: string;
}

/**
 * ZAP statistics API abstraction object
 */
export class ZAPStats {

	private static getApi(network: Network = Network.MainNet): HTTP<typeof PATHS> {
		switch (network) {
			case Network.TestNet: return testnetApi;
			default: return mainnetApi;
		}
	}

	/**
	 * 
	 * 
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getLiquidity = async ({ network }: GetLiquidityOpts): Promise<any> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("liquidity");
		const response = await http.get({ url });
		return await response.json();
	}

	/**
	 * 
	 * 
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getWeightedLiquidity = async ({ network }: GetWeightedLiquidityOpts): Promise<any> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("liquidity/weighted");
		const response = await http.get({ url });
		return await response.json();
	}

	/**
	 * 
	 * 
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getLiquidityChanges = async ({ network }: GetLiquidityChangesOpts): Promise<any> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("liquidity/changes");
		const response = await http.get({ url });
		return await response.json();
	}

	/**
	 * 
	 * 
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getSwaps = async ({ network }: GetSwapsOpts): Promise<any> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("swaps");
		const response = await http.get({ url });
		return await response.json();
	}
}
