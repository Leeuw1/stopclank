import { apiCall, loadChallenges } from './api.js'

let challengeData;

async function onWindowLoad() {
    try {
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_id='));

        if (!userCookie) {
            console.error('user_id cookie not found. Redirecting to login.');
            window.location.href = '/login';
            return;
        }

        const userId = userCookie.split('=')[1];
        console.log('User ID:', userId);
        const userInfo = await apiCall('GET', '/api/db/users?id=eq.' + userId);
		console.log('User info from API:', userInfo);

		if (!userInfo || userInfo.length === 0) {
			throw new Error('User not found in database. Please try logging in again.');
		}
		const user = userInfo[0];

		// Call the functions as before.
		populateStats(user, await loadChallenges());
		populateAugments(user);

    } catch (error) {
        console.error('Failed to parse cookie:', error);
        window.location.href = '/login';
    }
}
window.onload = onWindowLoad;


/**
 * Fills the 'task' div with the current objective and a link to the challenge.
 * @param {object} user - The user data object from the API.
 * @param {object} challengeData - The parsed challengeInfo.json data.
 */
function populateStats(user, challengeData) {
    const taskDiv = document.getElementById('stats');
    // Find the challenge name that corresponds to the user's current level
    const challengeName = Object.keys(challengeData).find(key => challengeData[key].number === user.current_level);

    if (challengeName) {
        taskDiv.innerHTML = `
            <h2>Current Task</h2>
            <p>You are on <strong>Level ${user.current_level}</strong> with a score of ${user.current_score}.</p>
            <p><a href="/challenges/${challengeName}">Click here to begin the challenge: ${challengeName}</a></p>
        `;
    } else {
        taskDiv.innerHTML = `
            <h2>Current Task</h2>
            <p>You have completed all available challenges with a score of ${user.current_score}! Congratulations!</p>
        `;
    }
}

/**
 * Fills the 'augments' div with a list of the user's acquired augments.
 * @param {object} user - The user data object from the API.
 */
function populateAugments(user) {
    const augmentsDiv = document.getElementById('augments');
    let content = '<h2>Acquired Augments</h2>';
    if (user.augments && user.augments.length > 0) {
        content += '<ul>';
        user.augments.forEach(augment => {
            content += `<li>${augment}</li>`;
        });
        content += '</ul>';
    } else {
        content += '<p>No augments acquired yet. Complete challenges to earn them.</p>';
    }
    augmentsDiv.innerHTML = content;
}
//Then, add flavour text, then redirect them to the appropriate challenge, or let them choose an 'augment'

