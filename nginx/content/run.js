import { apiCall, loadAugments, loadChallenges} from './api.js'

const storySetting = [
    "Prison cell",
    "...",
    "Oval office"
]

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
            // --- FIX: Move the cursor inside the new element ---
            currentElement.appendChild(cursor);
        } else if (nodeInfo.type === 'close') {
            const parent = currentElement.parentNode;
            // --- FIX: Move the cursor back to the parent element ---
            if (parent) {
                parent.insertBefore(cursor, currentElement.nextSibling);
                currentElement = parent;
            }
        } else if (nodeInfo.type === 'text') {
            typeText(nodeInfo.content);
            return; // Pause execution until text is typed
        }
        processNode(); // Immediately process next tag
    }

    function typeText(text) {
        let i = 0;
        function type() {
            if (i < text.length) {
                currentElement.insertBefore(document.createTextNode(text[i]), cursor);
                i++;
                setTimeout(type, speed);
            } else {
                processNode(); // Finished typing text, move to next node
            }
        }
        type();
    }

    processNode();
}

function populateStorySetting(user){
    const storyDiv = document.getElementById('story');
    const setting = storySetting[user.current_level] || "an Unknown Location";
    
    // Construct the text with a span for highlighting
    const fullText = `Current Location: <span class="setting-highlight">${setting}</span>`;
    
    typewriterEffect(storyDiv, fullText);
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

