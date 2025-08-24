import { apiCall } from './api.js'

const button = document.getElementById('goButton');
button.onclick = (event) => {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	if (username === '' || password === '') {
		return;
	}
	console.log(username);
	console.log(password);
	apiCall('GET', `/api/db/users?username=eq.${username}&password=eq.${password}`).then(results => {
		if (results === []) {
			return;
		}
		document.location.href = '/home';
	});
}
