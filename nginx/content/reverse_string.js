import { apiCall } from './api.js';

function log(msg) {
	const logs = document.getElementById('logs');
	logs.innerHTML += '<li> [DEBUG] ' + msg + '</li>'
}

function setStatus(text, color) {
	const status = document.getElementById('status');
	status.innerText = text;
	status.style.color = color;
}

async function submitCode(code) {
	// TODO: we can do some client-side validation
	const requestBody = {
		// NOTE: challenge is currently hard-coded
		challenge:	'reverse_string',
		code:		code,
	};
	return await apiCall('POST', '/api/test', requestBody);
}

async function challengeComplete(challenge) {
	/*
	const responseBody = {};
	responseBody[challenge] = true;
	const response = await apiCall(
		'PATCH',
		'/api/db/users?username=eq.shaco',
		responseBody,
	);
	*/
	const dbContents = await apiCall('GET', '/api/db/users');
	log(JSON.stringify(dbContents));
}

const button = document.getElementById('submitButton');
button.onclick = (event) => {
	const code = document.getElementById('codeArea').value;
	submitCode(code).then(msg => {
		log('status=' + msg.status);
		if (msg.status === 'pass') {
			setStatus('Passed!', '#00ff00');
			challengeComplete('reverse_string').then(() => {});
		}
		else {
			setStatus('Failed.', '#ff2020');
		}
	})
}

const codeArea = document.getElementById('codeArea');
codeArea.oninput = (event) => {
	setStatus('In progress...', '#00ccff');
}

// Initial status
setStatus('In progress...', '#00ccff');
