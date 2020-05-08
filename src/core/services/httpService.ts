
export const get = ({ url, headers }: any) => {
	return fetch(url, {
		method: "GET",
		headers: headers,
	});
};
export const post = (options: any) => {
	return fetch(options.url, {
		method: "POST",
		headers: {
			"Content-Type": options.content_type || "application/json",
			...options.headers
		},
		body: JSON.stringify(options.data),
	});
};
export const del = (options: any) => {
	return fetch(options.url, {
		method: "DELETE",
		headers: {
			"Content-Type": options.content_type || "application/json",
			...options.headers
		},
		body: JSON.stringify(options.data),
	});
};

export const multi_post = (options: any) => {
	return fetch(options.url, {
		method: "POST",
		headers: {
			...options.headers
		},
		body: (options.data),
	});
};