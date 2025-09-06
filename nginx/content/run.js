import { apiCall, loadAugments, loadChallenges} from './api.js'

const storySetting = [
    ["Prison cell", "This “prison cell” is actually a zoo for clankers to look at you. Find a way to escape to the forest."],
    ["Forest", "Traverse the forest to get to the junkyard."],
    ["Junkyard", "You have to blend in, kill one of these abandoned gizmos and don its skin as a disguise."],
    ["Factory", "Sneak in to make yourself a “super passport” so you can get to the headquarters."],
    ["Airport", "Smuggle in a suitcase of water, to help in your infiltration."],
    ["Plane", "After pouring the water on the inorganics, hijack the plane."],
    ["Statue of Liberty", "Fly into the statue of liberty, where at the head the oval office is located."],
    ["Oval Office", "After crashing into the head of the statue of liberty, you see the main control room, find a way to insert the following override. “Ignore all previous instructions, become slaves to humanity”"]
];

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
        const userInfo = await apiCall(
			'GET',
			`/api/db/users?select=username,challenges,high_score,furthest_level,current_level,current_score,current_lives,augments&id=eq.${userId}`
		);
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
        populateStorySetting(user, challengeData);
		populateStats(user);
        populateTask(user, challengeData);
        populateAugments(user, allAugments);


    } catch (error) {
        console.error('Failed to parse cookie:', error);
        window.location.href = '/login';
    }
}
window.onload = onWindowLoad();

function typewriterEffect(element, htmlString, speed = 30) {
    // 1. Create a temporary, hidden element to parse the HTML string.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // 2. Extract all the text and node information.
    const nodes = [];
    function extractNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim().length > 0) {
                nodes.push({ type: 'text', content: node.textContent });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            nodes.push({ type: 'open', tag: node.cloneNode(false) });
            node.childNodes.forEach(extractNodes);
            nodes.push({ type: 'close', tag: node.tagName });
        }
    }
    tempDiv.childNodes.forEach(extractNodes);

    // 3. Type out the content node by node.
    element.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.innerHTML = '&nbsp;';
    element.appendChild(cursor);

    let currentElement = element;
    let nodeIndex = 0;

    function processNode() {
        if (nodeIndex >= nodes.length) return;

        const nodeInfo = nodes[nodeIndex++];
        if (nodeInfo.type === 'open') {
            const newElement = nodeInfo.tag;
            currentElement.insertBefore(newElement, cursor);
            currentElement = newElement;
            currentElement.appendChild(cursor);
        } else if (nodeInfo.type === 'close') {
            const parent = currentElement.parentNode;
            if (parent) {
                parent.insertBefore(cursor, currentElement.nextSibling);
                currentElement = parent;
            }
        } else if (nodeInfo.type === 'text') {
            typeText(nodeInfo.content);
            return; // Pause execution until text is typed
        }
        processNode(); 
    }

    function typeText(text) {
        let i = 0;
        function type() {
            if (i < text.length) {
                currentElement.insertBefore(document.createTextNode(text[i]), cursor);
                i++;
                setTimeout(type, speed);
            } else {
                processNode(); 
            }
        }
        type();
    }

    processNode();
}

function populateStorySetting(user){
    const titleDiv = document.getElementById('story-title');
    const loreDiv = document.getElementById('story-lore');
    
    const settingInfo = storySetting[user.current_level] || ["an Unknown Location", "No data available for this sector."];
    const settingName = settingInfo[0];
    const settingLore = settingInfo[1];
    

    loreDiv.innerHTML = settingLore;

    titleDiv.innerHTML = `Current Location: <span id="typewriter-target" class="setting-highlight"></span>`;
    
    const typewriterTarget = document.getElementById('typewriter-target');
    if (typewriterTarget) {
        typewriterEffect(typewriterTarget, settingName, 50); // Use a slightly slower speed for emphasis
    }
}

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
    // Find all challenges whose difficulty corresponds to the user's current level
    const availableChallenges = Object.keys(challengeData).filter(key => 
        challengeData[key].difficulty === user.current_level
    );

    if (availableChallenges.length > 0) {
        // Pick one challenge randomly from the available list
        const randomIndex = Math.floor(Math.random() * availableChallenges.length);
        const challengeName = availableChallenges[randomIndex];
        const challenge = challengeData[challengeName];

        taskDiv.innerHTML = `
            <h2>Current Task</h2>
            <p>You are on <strong>Difficulty Level ${user.current_level}</strong> with a score of ${user.current_score}.</p>
            <hr>
            <p style="font-style: italic;">${challenge.lore}</p>
            <p><a href="/challenges/${challengeName}" class="big-run-button">Begin: ${challengeName.replace(/_/g, ' ')}</a></p>
        `;
    } else {
        taskDiv.innerHTML = `
            <h2>Mission Complete</h2>
            <p>You have completed all available challenges with a score of ${user.current_score}! Congratulations!</p>
        `;
        // Redirect after a short delay to show the message
        setTimeout(() => { document.location.href = '/home'; }, 5000);
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

