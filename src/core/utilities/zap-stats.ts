import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import moment, { Moment } from "moment";
import { Network } from "zilswap-sdk/lib/constants";
import { HTTP } from "./http";

const PATHS = {
	"liquidity/weighted": "/weighted_liquidity",
	"liquidity/changes": "/liquidity_changes",
	"liquidity": "/liquidity",
	"swaps": "/swaps",
	"volume": "/volume",
	"epoch/info": "/epoch/info",
};

const mainnetApi = new HTTP(process.env.REACT_APP_ZAP_API_MAINNET as string, PATHS);
const testnetApi = new HTTP(process.env.REACT_APP_ZAP_API_TESTNET as string, PATHS);

export interface SwapTransaction {
	id: string;
	transaction_hash: string;
	event_sequence: number;
	block_height: number;
	block_timestamp: Moment;
	initiator_address: string;
	token_address: string;
	token_amount: BigNumber;
	zil_amount: BigNumber;
	is_sending_zil: boolean;
}

export interface SwapVolume {
	pool: string;
	in_zil_amount: BigNumber;
	out_token_amount: BigNumber;
	out_zil_amount: BigNumber;
	in_token_amount: BigNumber;
}

export interface EpochInfo {
  epoch_start: number;
  max_epoch: number;
  epoch_period: number;
  next_epoch: number;
  current_epoch: number;
}

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

export interface GetSwapVolumeOpts extends PaginationOptions, QueryOptions {
	address?: string;
	pool?: string;
	from?: number;
	until?: number;
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
	static getEpochInfo = async ({ network }: QueryOptions): Promise<EpochInfo> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("epoch/info");
		const response = await http.get({ url });
		return await response.json();
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
	static getSwaps = async ({ network, ...query }: GetSwapVolumeOpts): Promise<SwapTransaction[]> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("swaps", {}, query);
		const response = await http.get({ url });
		const result = await response.json();
		return result?.records?.map((tx: any) => ({
			...tx,
			block_timestamp: moment(tx.block_timestamp),
			token_amount: bnOrZero(tx.token_amount),
			zil_amount: bnOrZero(tx.zil_amount),
		})) ?? [];
	}

	/**
	 * 
	 * 
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getSwapVolume = async ({ network, ...query }: GetSwapVolumeOpts = {}): Promise<any> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("volume", {}, query);
		const response = await http.get({ url });
		const pools = await response.json();
		return pools.map((pool: any): SwapVolume => ({
			...pool,
			in_zil_amount: bnOrZero(pool.in_zil_amount),
			in_token_amount: bnOrZero(pool.in_token_amount),
			out_zil_amount: bnOrZero(pool.out_zil_amount),
			out_token_amount: bnOrZero(pool.out_token_amount),
		}));
	}
}
