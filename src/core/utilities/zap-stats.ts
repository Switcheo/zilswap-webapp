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
	"distribution/info": "/distribution/info",
	"distribution/claimable_data": "/distribution/claimable_data/:address",
	"distribution/estimated_amounts": "/distribution/estimated_amounts/:address",
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

export interface Distributor {
	name: string;
  distributor_name: string;
	reward_token_symbol: string;
	reward_token_address_hex: string;
	distributor_address_hex: string;
	emission_info: EmissionInfo;
  incentivized_pools: {
    [pool: string]: number;
  }
}

export interface EmissionInfo {
	epoch_period: number;
  initial_epoch_number: number;
	tokens_per_epoch: string;
	tokens_for_retroactive_distribution: string;
	retroactive_distribution_cutoff_time: number;
	distribution_start_time: number;
	total_number_of_epochs: number;
	developer_token_ratio_bps: number;
	trader_token_ratio_bps: number;
}

export interface Distribution {
	id: string,
	distributor_address: string,
	epoch_number: number,
	address_bech32: string,
	address_hex: string,
	amount: BigNumber,
	proof: string[],
}

export interface EstimatedRewards {
  [distributor_address: string]: {  [pool: string]: string }
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
export interface GetEstimatedRewards extends QueryOptions {
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
   * @returns array of PoolLiquidity
   */
  static getLiquidity = async ({ network, ...query }: GetLiquidityOpts): Promise<ReadonlyArray<PoolLiquidity>> => {
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
	 * @returns map of token (pool) address to BigNumber in weighted liquidity amount
	 */
	static getWeightedLiquidity = async ({ network, from, until }: GetWeightedLiquidityOpts): Promise<{[pool: string]: BigNumber}> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("liquidity/weighted", {}, { from, until });
		const response = await http.get({ url });
		const result = await response.json() as ReadonlyArray<{ pool: string, amount: string }>;
		return result?.reduce((acc, item) => {
      acc[item.pool] = bnOrZero(item.amount);
      return acc
    }, {} as { [pool: string]: BigNumber });
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
		const url = http.path("transactions", {}, query).replaceAll('%2C', ',');
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
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getDistributionInfo = async ({ network }: QueryOptions): Promise<ReadonlyArray<Distributor>>  => {
		const http = ZAPStats.getApi(network);
		const url = http.path("distribution/info");
		const response = await http.get({ url });
		return await response.json();
	}

	/**
	 *
	 *
	 * @param network MainNet | TestNet - defaults to `MainNet`
	 * @returns response in JSON
	 */
	static getClaimableDistributions = async ({ network, address, ...query }: GetZWAPDistribution = {}): Promise<ReadonlyArray<Distribution>> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("distribution/claimable_data", { address }, query);
		const response = await http.get({ url });
		const distributions = await response.json();
		return distributions.map((distribution: any): Distribution => ({
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

	static getEstimatedRewards = async ({ network, address, ...query }: GetEstimatedRewards = {}): Promise<EstimatedRewards> => {
		const http = ZAPStats.getApi(network);
		const url = http.path("distribution/estimated_amounts", { address }, query);
		const response = await http.get({ url });
		const result = await response.json() as EstimatedRewards;
    return result
	}
}
