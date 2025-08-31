const HTTP_STATUS_NO_CONTENT = 204;

export async function apiCall(method, location, requestBody) {
	const request = {
		method:	method,
	};
	if (requestBody !== undefined) {
		const requestHeaders = new Headers();
		requestHeaders.append('Content-Type', 'application/json');
		//const jwt = ;
		//requestHeaders.append('Authorization', `Bearer ${jwt}`);
		request.headers = requestHeaders;
		request.body = JSON.stringify(requestBody);
	}
	console.log('API Call:', method, location, requestBody);
	const response = await fetch(location, request);
	console.log('API Response:', response.status, response);
	if (response.status !== HTTP_STATUS_NO_CONTENT) {
		return await response.json();
	}
}
