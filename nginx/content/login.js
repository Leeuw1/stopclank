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

const signUpButton = document.getElementById('signUpPage');
signUpButton.onclick = (event) => {
	document.location.href = '/signup';
}

const googleButtonDiv = document.getElementById('googleButton');

// Initialize Google Identity Services once on page load
window.onload = () => {
	google.accounts.id.initialize({
		client_id: '656875104001-epld0cd8pame8tu3gk79gocv8usjisme.apps.googleusercontent.com',
		callback: handleGoogleResponse,
		auto_select: false, 
	});
	google.accounts.id.renderButton(googleButtonDiv, { theme: "outline", size: "large" });
};

// Callback function after Google login
function handleGoogleResponse(response) {
	if (!response || !response.credential) {
		console.error('No credential returned from Google');
		return;
	}
	const idToken = response.credential;
	// Send the ID token to your backend
	apiCall('POST', '/api/db/rpc/login_google', { google_id_token: idToken })
		.then((result) => {
		console.log('SQL is returning:', result);
		if (result) {
			console.log('Success or error message: ' + result);
			window.location.href = '/home'; // Redirect on successful login
		} else {
			console.error('Login failed on backend');
		}
		})
		.catch((err) => {
		console.error('Error during login API call:', err);
		});
}