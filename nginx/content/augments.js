import { apiCall, loadAugments } from "./api.js";

/*
Possiple future augments: more text cases, hints, time extensions, skip level, lore, 
*/
let userId = 0;
window.onload = async () => {
    try {
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_id='));
        userId = userCookie.split('=')[1];
        console.log('User ID:', userId);
    
        const userInfo = await apiCall('GET', '/api/db/users?id=eq.' + userId);
        const allAugments = await loadAugments();

		if (!userInfo || userInfo.length === 0) {
			throw new Error('User not found in database. Please try logging in again.');
		}
		const user = userInfo[0];

		//pick 2 random augments from the list
		populatePassiveAugments(user, allAugments);
		populateAugmentOptions(allAugments);
    } catch (error) {
        console.error('Failed to parse cookie:', error);
        window.location.href = '/login';
    }
}

function populatePassiveAugments(user, allAugments) {
    const container = document.getElementById('passive-augments');
    if (!user.augments || user.augments.length === 0) {
        container.innerHTML += '<p>No passive abilities acquired yet.</p>';
        return;
    }
    
    let content = '<ul>';
    user.augments.forEach(augmentKey => {
        const augmentDef = allAugments[augmentKey];
        if (augmentDef) {
            content += `<li><strong>${augmentDef.name}:</strong> ${augmentDef.description}</li>`;
        }
    });
    content += '</ul>';
    container.innerHTML += content;
}

function populateAugmentOptions(allAugments) {
    const container = document.getElementById('augment-choices');
    container.innerHTML = '<h2>Choose Your Upgrade</h2>';

    const augmentKeys = Object.keys(allAugments);
    const choices = getRandomItems(augmentKeys, 3); // Offer 3 random choices

    const ul = document.createElement('ul');
    ul.className = 'augment-list';

    choices.forEach(augmentKey => {
        const augment = allAugments[augmentKey];
        const li = document.createElement('li');
        
        li.className = `augment-card rarity-${augment.rarity || 'common'}`;
        
        li.innerHTML = `<h3>${augment.name}</h3><p>${augment.description}</p>`;
        
        li.onclick = () => handleAugmentChoice(augmentKey, augment.name, ul);
        ul.appendChild(li);
    });

    container.appendChild(ul);
}

async function handleAugmentChoice(augmentKey, augmentName, listElement) {
    console.log(`Chose augment: ${augmentKey}`);
    listElement.innerHTML = `<p>Applying upgrade: <strong>${augmentName}</strong>...</p>`;
    
    try {
        await apiCall('POST', '/api/db/rpc/add_augment', { p_user_id: parseInt(userId), p_augment_key: augmentKey });
        window.location.href = '/run';
    } catch (err) {
        console.error("Failed to add augment:", err);
        listElement.innerHTML = `<p style="color:red;">Error applying upgrade. Please refresh and try again.</p>`;
    }
}

function getRandomItems(arr, n) {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);
    if (n > len) {
        throw new RangeError("getRandomItems: more elements taken than available");
    }
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
