import { apiCall } from './api.js';

function basename(path) {
	return path.substr(path.lastIndexOf('/') + 1);
}

const challenge = basename(document.location.pathname);
// TODO: maybe put this in a .json file
const challengeInfo = {
	reverse_string:	{
		number:				0,
		descriptionHtml:	'Given a string <code>s</code>, return <code>s</code> but with the characters in reverse order.',
		codeTemplate:		'# Complete this function\ndef reverse_string(s):\n    ',
	},
	merge:	{
		number:				1,
		descriptionHtml:	'Given two sorted arrays, <code>a</code> and <code>b</code>, return an array with the elements of both <code>a</code> and <code>b</code> but in sorted order.',
		codeTemplate:		'# Complete this function\ndef merge(a, b):\n    ',
	},
}

function log(msg) {
	const logs = document.getElementById('logs');
	logs.innerHTML += '<li> [DEBUG] ' + msg + '</li>'
}

function setStatus(text, color) {
	const status = document.getElementById('status');
	status.textContent = text;
	status.style.color = color;
}

async function submitCode(code) {
	// TODO: we can do some client-side validation
	const requestBody = {
		challenge:	challengeInfo[challenge].number,
		code:		code,
	};
	return await apiCall('POST', '/api/test', requestBody);
}

async function challengeComplete() {
	const dbContents = await apiCall('GET', '/api/db/users');
	log(JSON.stringify(dbContents));
}

const button = document.getElementById('submitButton');
button.onclick = (event) => {
	const code = document.getElementById('codeArea').value;
	submitCode(code).then(msg => {
		if (msg.status === undefined) {
			log('status=bad_request');
			return;
		}
		log('status=' + msg.status);
		if (msg.status === 'pass') {
			setStatus('Passed!', '#00ff00');
			challengeComplete().then(() => {});
		}
		else {
			setStatus('Failed.', '#ff2020');
		}
	});
}

const codeArea = document.getElementById('codeArea');
codeArea.oninput = (event) => {
	setStatus('In progress...', '#00ccff');
}

// Initialize title, description, codeArea
const title = document.getElementById('title');
title.textContent = `Challenge #${challengeInfo[challenge].number}: ${challenge}`;
const description = document.getElementById('description');
description.innerHTML = challengeInfo[challenge].descriptionHtml;
codeArea.textContent = challengeInfo[challenge].codeTemplate;

// Initial status
setStatus('In progress...', '#00ccff');
