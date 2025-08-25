import { apiCall } from './api.js'

const button = document.getElementById('goButton');
button.onclick = (event) => {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	if (username === '' || password === '') {
		return;
	}
	const requestBody = {
		login_username: username,
		login_password: password,
	};
	apiCall('POST', '/api/db/rpc/login', requestBody).then(success => {
		if (success) {
			document.location.href = '/home';
		}
	});
}
