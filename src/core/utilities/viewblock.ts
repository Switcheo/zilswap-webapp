import { HTTP } from "./http";
import { toBech32Address } from "@zilliqa-js/crypto";

const API_KEY = process.env.REACT_APP_VIEWBLOCK_API_KEY;

const headers = {
	"X-APIKEY": API_KEY
}
export const PATH_PREFIX = "https://api.viewblock.io/v1";

const PATHS = {
	getBalance: "/zilliqa/addresses/:address",
	listTransactions: "/zilliqa/addresses/:address/txs",
};

const http = new HTTP(PATH_PREFIX, PATHS);

/**
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
	static listTransactions = async ({ network = "testnet", page = 1, type = "all", address }: any): Promise<any> => {
		const url = http.path("listTransactions", { address }, { network, page, type });
		const response = await http.get({ url, headers });
		return await response.json();
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
}