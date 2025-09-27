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
	const response = await fetch(location, request);
	if (response.status !== HTTP_STATUS_NO_CONTENT) {
		return await response.json();
	}
}

export async function loadChallenges() {
	const response = await fetch('/challenges.json')
	return await response.json();
}

let augmentDataCache = null;

export async function loadAugments() {
	if (augmentDataCache) {
		return augmentDataCache;
	}
	const response = await fetch('/augments.json');
	augmentDataCache = await response.json();
	return augmentDataCache;
}

