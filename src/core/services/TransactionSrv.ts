import * as HTTPSrv from "./httpService";
import querystring from "query-string";

const headers = {
	"X-APIKEY": "74da2e513cb0ce63ad6733f0d09a074b614ca9752a9e8201ab28678814fbc39a"
}
const QUERY_PATH = "https://api.viewblock.io/v1/zilliqa/:address/txs"

const getPath = (url: string, route_params?: any, query_params?: any) => {
	if (route_params) {
		for (var paramKey in route_params)
			url = url.replace(`:${paramKey}`, route_params[paramKey]);
	}
	if (query_params)
		url += "?" + querystring.stringify(query_params);
	return url;
}

export const listTransations = async ({ network = "testnet", page = 1, type = "all", address }: any) => {
	const url = getPath(QUERY_PATH, { address }, { network, page, type });

	let response = await HTTPSrv.get({ url, headers });
	response = await response.json();

	console.log({ response });
	return response;
}