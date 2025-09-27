import { apiCall } from './api.js'

window.onload = () => {
    try {
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_id='));

        if (!userCookie) {
            console.error('user_id cookie not found. Redirecting to login.');
            window.location.href = '/login';
            return;
        }

        const userId = userCookie.split('=')[1];
        apiCall(
			'GET',
			`/api/db/users?select=username,challenges,high_score,furthest_level,current_level,current_score,current_lives,augments&id=eq.${userId}`
		).then(userInfo => {

			if (!userInfo || userInfo.length === 0) {
				throw new Error('User not found in database. Please try logging in again.');
			}
			populateProfile(userInfo);
		}).catch(error => {
			console.error('Failed to load page data:', error);
			document.body.innerHTML = `<h1>Error loading page data</h1><p>${error.message}</p>`;
		});
    } catch (error) {
        console.error('Failed to parse cookie:', error);
        window.location.href = '/login';
    }
};

function populateProfile(userArray) {
    const profileDiv = document.getElementById('profile');
    if (!userArray || userArray.length === 0) {
        profileDiv.textContent = "No user data available.";
        return;
    }

    const user = userArray[0]; // first user

    // Convert challenges bitstring into readable list
    const challenges = [];
    for (let i = 0; i < user.challenges.length; i++) {
        if (user.challenges[i] === "1") {
            challenges.push(i); // challenge number at position i is completed
        }
    }
    const challengeText = challenges.length > 0 
        ? challenges.join(", ") 
        : "None";

    profileDiv.innerHTML = `
        <h2>Profile: ${user.username}</h2>
        <p><strong>High Score:</strong> ${user.high_score}</p>
        <p><strong>Furthest Level:</strong> ${user.furthest_level}</p>
        <p><strong>Current Level:</strong> ${user.current_level}</p>
        <p><strong>Current Score:</strong> ${user.current_score}</p>
        <p><strong>Lives Left:</strong> ${user.current_lives}</p>
        <p><strong>Augments:</strong> ${user.augments.length > 0 ? user.augments.join(", ") : "None"}</p>
        <p><strong>List of completed Challenges:</strong> [${challengeText}]</p>
    `;
}
