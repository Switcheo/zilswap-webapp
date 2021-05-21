import { HTTP } from "./http";
import { toBech32Address, fromBech32Address } from "@zilliqa-js/crypto";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";

const API_KEY_LIBRARY = process.env.REACT_APP_VIEWBLOCK_API_KEY?.split(",") ?? [];
const API_KEY = (() => {
	const viewblockAffinity = parseInt(sessionStorage.getItem("vb-aff") ?? "-1");
	const key = API_KEY_LIBRARY[viewblockAffinity];
	if (key) return key;
	const index = Math.floor(Math.random() * API_KEY_LIBRARY.length);
	if (index >= API_KEY_LIBRARY.length) return undefined;

	sessionStorage.setItem("vb-aff", index.toString());
	return API_KEY_LIBRARY[index];
})();

const headers = {
	"X-APIKEY": API_KEY
}
export const PATH_PREFIX = "https://api.viewblock.io/v1";

const PATHS = {
	getBalance: "/zilliqa/addresses/:address",
	listTransactions: "/zilliqa/addresses/:address/txs",
	listEvents: "/zilliqa/contracts/:address/events/:event",
};

const http = new HTTP(PATH_PREFIX, PATHS);

export interface ZilInternalTransfer {
	from: string;
	to: string;
	value: BigNumber;
	direction: "in";
	depth: string;
};

export interface ZilTransition {
	accepted: boolean;
	addr: string;
	depth: 0;

	msg: unknown;
};

export interface ZilEvent {
	address: string;
	name: string;
	details: string;

	params: any;
};

export interface ZilDataValue {
	type: "Uint128" | "ByStr20" | "BNum";
	value: string;
	vname: string;
};

export interface ZilTxData {
	_tag: string;
	params: ZilDataValue[];
};

export interface ZilTransaction {
	hash: string;
	from: string;
	blockHeight: number;
	fee: BigNumber;
	value: BigNumber;
	timestamp: dayjs.Dayjs;
	direction: "in";
	receiptSuccess: boolean;

	events: ZilEvent[];
	internalTransfers: ZilInternalTransfer[];
	transitions: ZilTransition[];

	data?: ZilTxData;
};

/**
 * @deprecated not used due to rate limits on API
 * ViewBlock API abstraction object
 */
export class ViewBlock {

	/**
	 * Static function to retrieve transactions from ViewBlock given a ZIL address.
	 *
	 * @param address address to query.
	 * @param network mainnet | testnet - defaults to `testnet`
	 * @param page pagination - defaults to 1
	 * @param type transaction type filter - defaults to `all`
	 * @returns response in JSON representation
	 */
	static listTransactions = async ({ network = "testnet", page = 1, type = "all", address, limit = 25 }: any): Promise<ZilTransaction[]> => {
		const url = http.path("listTransactions", { address }, { network, page, type, limit });
		const response = await http.get({ url, headers });
		const result = await response.json();

		return result.map((tx: any) => {
			let data: ZilTxData | undefined;
			try { data = JSON.parse(tx.data) as ZilTxData; } catch (e) {}
			return {
				...tx,
				value: new BigNumber(tx.value),
				fee: new BigNumber(tx.fee),
				timestamp: dayjs.unix(tx.timestamp / 1000),
				data,
			} as ZilTransaction;
		})
	}

	/**
	 * Static function to retrieve ZIL balance from ViewBlock given a ZIL address.
	 *
	 * @param address address to query.
	 * @param network mainnet | testnet - defaults to `testnet`
	 * @returns response in JSON representation
	 */
	static getBalance = async ({ network = "testnet", address }: any): Promise<any> => {
		const url = http.path("getBalance", { address: toBech32Address(address) }, { network, type: "all" });
		const response = await http.get({ url, headers });
		return await response.json();
	}

	/**
	 * Static function to query Contract Events from ViewBlock given a contact address and event name.
	 *
	 * @param address address to query.
	 * @param network mainnet | testnet - defaults to `testnet`
	 * @param event event types to query.
	 * @param page page number for pagination.
	 * @returns response in JSON representation
	 */
	static listEvents = async ({ network = "testnet", address, event, page }: any): Promise<ZilTransaction[]> => {
		const url = http.path("listEvents", { address: fromBech32Address(address), event }, { network, page });
		const response = await http.get({ url, headers });
		const result = await response.json();

		return result.txs?.map((tx: any) => {
			let data: ZilTxData | undefined;
			try { data = JSON.parse(tx.data) as ZilTxData; } catch (e) {}
			return {
				...tx,
				value: new BigNumber(tx.value),
				fee: new BigNumber(tx.fee),
				timestamp: dayjs.unix(tx.timestamp / 1000),
				data,
			} as ZilTransaction;
		})
	}
}
