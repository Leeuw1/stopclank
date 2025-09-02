import { apiCall, loadAugments, loadChallenges} from './api.js'


async function onWindowLoad() {
    try {
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_id='));

        if (!userCookie) {
            console.error('user_id cookie not found. Redirecting to login.');
            window.location.href = '/login';
            return;
        }

        const userId = userCookie.split('=')[1];
        
        //fetch the data
        const userInfo = await apiCall('GET', '/api/db/users?id=eq.' + userId);
        console.log('0: User info from API:', userInfo);
        const allAugments = await loadAugments();
        console.log('1: All augments from API:', allAugments);
        const challengeData = await loadChallenges();
        console.log('3: Challenge data:', challengeData);

		if (!userInfo || userInfo.length === 0) {
			throw new Error('User not found in database. Please try logging in again.');
		}
		const user = userInfo[0];

		// Call the functions as before.
		populateStats(user);
        populateTask(user, challengeData);
        populateAugments(user, allAugments);


    } catch (error) {
        console.error('Failed to parse cookie:', error);
        window.location.href = '/login';
    }
}
window.onload = onWindowLoad();



function populateStats(user) {
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <h2>Your Stats</h2>
        <ul>
            <li>High Score: ${user.high_score}</li>
            <li>Furthest Level Reached: ${user.furthest_level}</li>
            <li>Current Lives: ${user.current_lives}</li>
        </ul>
    `;
}


function populateTask(user, challengeData) {
    const taskDiv = document.getElementById('task');
    // Find the challenge name whose difficulty corresponds to the user's current level
    const availableChallenges = Object.keys(challengeData).filter(key => 
        challengeData[key].difficulty === user.current_level
    );
    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
    const challengeName = availableChallenges[randomIndex];

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
        document.location.href = '/home';
    }
}


function populateAugments(user, allAugments) {
    const augmentsDiv = document.getElementById('augments');
    let content = '<h2>Acquired Augments</h2>';
    if (user.augments && user.augments.length > 0) {
        content += '<ul>';
        user.augments.forEach(augment => {
            const augmentDef = allAugments[augment];
            content += `<li><strong>${augmentDef.name}:</strong> ${augmentDef.description}</li>`;
        });
        content += '</ul>';
        augmentsDiv.innerHTML += content;
    } else {
        augmentsDiv.innerHTML += '<p>No passive abilities acquired yet.</p>';
    }
}

