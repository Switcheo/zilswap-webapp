import querystring from "query-string";

/**
 * API endpoint specifications.
 * 
 * @see HTTP<PathSpecs> for details on usage.
 */
export type PathSpecs = {
	[index: string]: string;
};

/**
 * Helper class for abstracting URL manipulation specifically for 
 * API endpoints.
 * 
 */
export class HTTP<PathSpecs> {
	apiPrefix: string;
	apiEndpoints: PathSpecs;

	/**
	 * Constructor for `HTTP` helper class.
	 * 
	 * `apiEndpoints` example:
	 * ```javascript
	 *	{
	 *		getBalance: "/zilliqa/addresses/:address",
	 *		listTransactions: "/zilliqa/addresses/:address/txs",
	 *	};
	 * ```
	 * 
	 * @param apiPrefix prefix to add for all endpoints URL construction.
	 * @param apiEndpoints see `apiEndpoints` example above.
	 */
	constructor(apiPrefix: string, apiEndpoints: PathSpecs) {
		this.apiPrefix = apiPrefix;
		this.apiEndpoints = apiEndpoints;
	}

	/**
	 * Path generator to obtain URL for a specific endpoint
	 * provided in the constructor.
	 * 
	 * example usage:
	 * ```javascript
	 * const http = new HTTP("http://localhost/api", { getUser: "/users/:user_id/detail" });
	 * const url = http.path("getUser", { user_id: 42 }, { access_token: "awesomeAccessToken" });
	 * // url: http://localhost/api/users/42/detail?access_token=awesomeAccessToken
	 * ```
	 * 
	 * @param path a key of apiEndpoints provided in the constructor.
	 * @param routeParams object map for route parameters.
	 * @param queryParams object map for query parameters.
	 */
	path = (path: keyof PathSpecs, routeParams?: any, queryParams?: any) => {
		let url = `${this.apiPrefix}${this.apiEndpoints[path]}`;

		// substitute route params
		if (routeParams) {
			for (var paramKey in routeParams)
				url = url.replace(`:${paramKey}`, routeParams[paramKey]);
		}

		// append query params
		if (queryParams)
			url += "?" + querystring.stringify(queryParams);
		return url;
	}

	/**
	 * Executes HTTP GET request with fetch
	 */
	get = ({ url, headers }: any) => {
		return fetch(url, {
			method: "GET",
			headers: headers,
		});
	};

	/**
	 * Executes HTTP POST request with fetch
	 */
	post = (options: any) => {
		return fetch(options.url, {
			method: "POST",
			headers: {
				"Content-Type": options.content_type || "application/json",
				...options.headers
			},
			body: JSON.stringify(options.data),
		});
	};

	/**
	 * Executes HTTP DELETE request with fetch
	 */
	del = (options: any) => {
		return fetch(options.url, {
			method: "DELETE",
			headers: {
				"Content-Type": options.content_type || "application/json",
				...options.headers
			},
			body: JSON.stringify(options.data),
		});
	};

	/**
	 * Executes HTTP multipart POST request with fetch
	 */
	multi_post = (options: any) => {
		return fetch(options.url, {
			method: "POST",
			headers: {
				...options.headers
			},
			body: (options.data),
		});
	};
};
