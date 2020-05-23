import querystring from "query-string";

export type PathSpecs = {
	[index: string]: string;
};

export class HTTP<PathSpecs> {
	apiPrefix: string;
	apiEndpoints: PathSpecs;
	constructor(apiPrefix: string, apiEndpoints: PathSpecs) {
		this.apiPrefix = apiPrefix;
		this.apiEndpoints = apiEndpoints;
	}

	path = (path: keyof PathSpecs, route_params?: any, query_params?: any) => {
		let url = `${this.apiPrefix}${this.apiEndpoints[path]}`;
		if (route_params) {
			for (var paramKey in route_params)
				url = url.replace(`:${paramKey}`, route_params[paramKey]);
		}
		if (query_params)
			url += "?" + querystring.stringify(query_params);
		return url;
	}

	get = ({ url, headers }: any) => {
		return fetch(url, {
			method: "GET",
			headers: headers,
		});
	};
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