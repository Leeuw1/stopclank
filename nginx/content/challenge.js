import { apiCall, loadChallenges } from './api.js';

const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_id='));
let userId;

if (!userCookie) {
    console.error('user_id cookie not found. Redirecting to login.');
    window.location.href = '/login';
} else {
    userId = userCookie.split('=')[1];
}

const userInfo = await apiCall('GET', `/api/db/users?select=current_lives&id=eq.${userId}`);
console.log('User lives from API:', userInfo);

if (!userInfo || userInfo.length === 0) {
    throw new Error('User not found in database. Please try logging in again.');
}
const lives = userInfo[0].current_lives;
renderLives(lives);


function basename(path) {
	return path.substr(path.lastIndexOf('/') + 1);
}

const challenge = basename(document.location.pathname);
let challengeInfo;

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

const pyodidePromise = loadPyodide();

async function runTest() {
	const codeArea = document.getElementById('codeArea');
	const pyodide = await pyodidePromise;
	const inputRow = document.getElementById('testInputs');
	const resultRow = document.getElementById('testResults');
	inputRow.innerHTML = '<th>Test Input</th>' + challengeInfo[challenge].tests
		.map(input => `<td>${input}</td>`)
		.reduce((a, b) => a + b);
	resultRow.innerHTML = '<th>Result</th>' + challengeInfo[challenge].tests
		.map(input => `<td>${pyodide.runPython(codeArea.value + `\n${challenge}(${input})`)}</td>`)
		.reduce((a, b) => a + b);
}

const testButton = document.getElementById('testButton');
testButton.onclick = runTest;

const button = document.getElementById('submitButton');
button.onclick = (event) => {
	const code = document.getElementById('codeArea').value;
	submitCode(code).then(msg => {
		if (msg.status === undefined) {
			log('status=bad_request');
			return;
		}
		log('status=' + msg.status);
		if (msg.status === 'level_complete') {
			setStatus('Passed!', '#00ff00');
			setTimeout(() => {
                window.location.href = '/augments'; // Redirect to the main run page
            }, 2000);
		}
		else {
			setStatus('Failed.', '#ff2020');
			//lose a life, returns # of lives left
			apiCall('POST', '/api/db/rpc/lose_life', { user_id: userId }).then(result => {
				console.log('lose_life is returning: ', result);
				renderLives(result);
				if (result <= 0) {
					alert('You have no lives left! Returning to home page.');
					window.location.href = '/home';
				}
				else {
					alert('You have ' + result + ' lives remaining.');
				}
			});
		}
	});
}

const codeArea = document.getElementById('codeArea');
codeArea.oninput = (event) => {
	setStatus('In progress...', '#00ccff');
}

loadChallenges().then(info => {
	challengeInfo = info;
	// Initialize title, description, codeArea
	const title = document.getElementById('title');
	title.textContent = `Challenge #${challengeInfo[challenge].number}: ${challenge}`;
	const description = document.getElementById('description');
	description.innerHTML = challengeInfo[challenge].descriptionHtml;
	codeArea.textContent = challengeInfo[challenge].codeTemplate;

	// Initial status
	setStatus('In progress...', '#00ccff');
});

function renderLives(lives, maxLives=3) {
    const livesDiv = document.getElementById('lives');
    livesDiv.innerHTML = "❤️".repeat(lives) + "🤍".repeat(maxLives - lives); 
}