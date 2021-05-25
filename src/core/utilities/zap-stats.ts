import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import dayjs, { Dayjs } from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";
import { HTTP } from "./http";

const PATHS = {
	"liquidity/weighted": "/weighted_liquidity",
	"liquidity/changes": "/liquidity_changes",
	"liquidity": "/liquidity",
	"swaps": "/swaps",
	"volume": "/volume",
	"transactions": "/transactions",
	"epoch/info": "/epoch/info",
	"distribution/data": "/distribution/data/:address",
	"distribution/weights": "/distribution/pool_weights",
	"distribution/current": "/distribution/current/:address",
};

const mainnetApi = new HTTP(process.env.REACT_APP_ZAP_API_MAINNET as string, PATHS);
const testnetApi = new HTTP(process.env.REACT_APP_ZAP_API_TESTNET as string, PATHS);

export interface SwapTransaction {
	id: string;
	transaction_hash: string;
	event_sequence: number;
	block_height: number;
	block_timestamp: Dayjs;
	initiator_address: string;
	token_address: string;
	token_amount: BigNumber;
	zil_amount: BigNumber;
	is_sending_zil: boolean;
}

export interface PoolTransaction {
	id: string;
	transaction_hash: string;
	block_height: number;
	block_timestamp: Dayjs;
	initiator_address: string;
	token_address: string;

	token_amount: BigNumber;
	zil_amount: BigNumber;

	tx_type: "liquidity" | "swap";

	swap0_is_sending_zil?: boolean;

	swap1_token_address?: string;
	swap1_token_amount?: BigNumber;
	swap1_zil_amount?: BigNumber;
	swap1_is_sending_zil?: boolean;

	change_amount?: BigNumber;
}

export interface PoolTransactionResult {
	records: PoolTransaction[];
	total_pages: number;
}

export interface PoolLiquidity {
	pool: string;
	amount: BigNumber;
}

export interface SwapVolume {
	pool: string;
	in_zil_amount: BigNumber;
	out_token_amount: BigNumber;
	out_zil_amount: BigNumber;
	in_token_amount: BigNumber;
}

export interface EpochInfo {
	current_epoch: number;
	epoch_period: number;
	first_epoch_start: number;
	next_epoch_start: number;
	tokens_per_epoch: number;
	total_epoch: number;
}

export interface ZWAPDistribution {
	id: string,
	epoch_number: number,
	address_bech32: string,
	address_hex: string,
	amount: BigNumber,
	proof: string[],
}

export interface ZWAPPotentialRewards {
	[pool: string]: BigNumber;
}

export interface ZWAPPoolWeights {
	[pool: string]: BigNumber;
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
	from?: number;
	until?: number;
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

export interface TxOpts extends PaginationOptions, QueryOptions {
	address?: string;
	pool?: string;
	from?: number;
	until?: number;
}

export interface GetEpochData extends QueryOptions {
	address?: string;
	pool?: string;
}

export interface GetZWAPDistribution extends QueryOptions {
	address?: string;
}
export interface GetPotentialRewards extends QueryOptions {
	address?: string;
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
	static getLiquidity = async ({ network, ...query }: GetLiquidityOpts): Promise<PoolLiquidity[]> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("liquidity", {}, query);
		const response = await http.get({ url });
		const result = await response.json();
		return result.map((pool: any) => ({
			...pool,
			amount: bnOrZero(pool.amount),
		}));
	}

	/**
	 *
	 *
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getWeightedLiquidity = async ({ network, from, until }: GetWeightedLiquidityOpts): Promise<PoolLiquidity[]> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("liquidity/weighted", {}, { from, until });
		const response = await http.get({ url });
		const result = await response.json();
		return result?.map((pool: any) => ({
			...pool,
			amount: bnOrZero(pool.amount),
		}));
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
	static getPoolTransactions = async ({ network, ...query }: TxOpts): Promise<PoolTransactionResult> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("transactions", {}, query);
		const response = await http.get({ url });
		const result = await response.json();
		return {
			...result,
			records: result?.records?.map((tx: any) => ({
				...tx,
				block_timestamp: dayjs(tx.block_timestamp + 'Z'),

				token_amount: bnOrZero(tx.token_amount),
				zil_amount: bnOrZero(tx.zil_amount),

				swap1_token_amount: bnOrZero(tx.swap1_token_amount),
				swap1_zil_amount: bnOrZero(tx.swap1_zil_amount),

				change_amount: bnOrZero(tx.change_amount),
			})) ?? [],
		} as PoolTransactionResult;
	}

	/**
	 *
	 *
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getSwaps = async ({ network, ...query }: TxOpts): Promise<SwapTransaction[]> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("swaps", {}, query);
		const response = await http.get({ url });
		const result = await response.json();
		return result?.records?.map((tx: any) => ({
			...tx,
			block_timestamp: dayjs(tx.block_timestamp + 'Z'),
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
	static getSwapVolume = async ({ network, ...query }: TxOpts = {}): Promise<any> => {
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

	/**
	 *
	 *
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getZWAPDistributions = async ({ network, address, ...query }: GetZWAPDistribution = {}): Promise<ZWAPDistribution[]> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("distribution/data", { address }, query);
		const response = await http.get({ url });
		const distributions = await response.json();
		return distributions.map((distribution: any): ZWAPDistribution => ({
			...distribution,
			amount: bnOrZero(distribution.amount),
			proof: distribution.proof.split(" "),
		}));
	}

	/**
	 *
	 *
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getPotentialRewards = async ({ network, address, ...query }: GetPotentialRewards = {}): Promise<ZWAPPotentialRewards> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("distribution/current", { address }, query);
		const response = await http.get({ url });
		const result = await response.json();

		const output: ZWAPPotentialRewards = {};
		Object.keys(result).forEach((poolAddress) => {
			output[poolAddress] = bnOrZero(result[poolAddress]);
		});

		return output;
	}
	/**
	 *
	 *
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getPoolWeights = async ({ network }: QueryOptions = {}): Promise<ZWAPPoolWeights> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("distribution/weights");
		const response = await http.get({ url });
		const result = await response.json();

		const output: ZWAPPoolWeights = {};
		Object.keys(result).forEach((poolAddress) => {
			output[poolAddress] = bnOrZero(result[poolAddress]);
		});

		return output;
	}
}
