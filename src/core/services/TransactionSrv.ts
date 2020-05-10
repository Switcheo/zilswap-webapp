import * as HTTPSrv from "./httpService";
import querystring from "query-string";

const headers = {
	"X-APIKEY": "05d219b0475304c1c1f61c564877ceda894ef3ce66202034363e7dca2886af03"
}
const QUERY_PATH = "https://api.viewblock.io/v1/zilliqa/addresses/:address/txs"

const getPath = (url: string, route_params?: any, query_params?: any) => {
	if (route_params) {
		for (var paramKey in route_params)
			url = url.replace(`:${paramKey}`, route_params[paramKey]);
	}
	if (query_params)
		url += "?" + querystring.stringify(query_params);
	return url;
}

export const listTransactions = async ({ network = "testnet", page = 1, type = "all", address }: any) => {
	console.log(address)
	const url = getPath(QUERY_PATH, { address }, { network, page, type });

	let response = await HTTPSrv.get({ url, headers });
	response = await response.json();
	return response;
}