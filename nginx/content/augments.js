import { apiCall } from "./api.js";

const augmentList = {
    increase_base_points_100: {
        type: "additive",
        description: "Gain 100 points every time you complete a challenge",
        unique: false,
        value: 100
    },
    extra_points_500: {
        type: "points",
        description: "Gain 500 points one time",
        unique: false,
        value: 500
    },
    extra_life_1: {
        type: "life",
        description: "Gain 1 extra life",
        unique: false,
        value: 1
    },
    extra_life_3: {
        type: "life",
        description: "Gain 3 extra lives",
        unique: false,
        value: 3
    },
    point_multiplier_50: {
        type: "multiplier",
        description: "Multiply future points earned by 1.5",
        unique: false,
        value: 1.5
    },
    point_multiplier_100:{
        type: "multiplier",
        description: "Multiply future points earned by 2.0",
        unique: false,
        value: 2.0
    }
};
/*
Possiple future augments: more text cases, hints, time extensions, skip level, lore, 
*/
let userId = 0;
window.onload = () => {
    console.log("0");
    try {
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user_id='));
        console.log('1');
        userId = userCookie.split('=')[1];
        console.log('User ID:', userId);
        console.log('2');
        apiCall('GET', '/api/db/users?id=eq.' + userId)
            .then(userInfo => { 
                console.log('3');
                console.log('User info from API:', userInfo);

                if (!userInfo || userInfo.length === 0) {
                    throw new Error('User not found in database. Please try logging in again.');
                }
                const user = userInfo[0];

                //pick 2 random augments from the list
                
                populateUserAugments(user);
                populateAugmentOptions();
            }).catch(error => {
                console.error('Failed to load page data:', error);
                document.body.innerHTML = `<h1>Error loading page data</h1><p>${error.message}</p>`;
            });
    } catch (error) {
        console.error('Failed to parse cookie:', error);
        window.location.href = '/login';
    }
};

function populateAugmentOptions(){
    const augmentsDiv = document.getElementById('augmentsList');
    augmentsDiv.innerHTML = '<h2>Available Augments</h2>';
    const augmentKeys = Object.keys(augmentList);
    let augOne = getRandomInteger(0, augmentKeys.length - 1);
    let augTwo = -1;
    while (augTwo === -1 || augTwo === augOne) {
        augTwo = getRandomInteger(0, augmentKeys.length - 1);
    }
    const ul = document.createElement('ul');
    [augOne, augTwo].forEach(index => {
        const augmentKey = augmentKeys[index];
        const augment = augmentList[augmentKey];
        if (augment) {
            const li = document.createElement('li');
            li.textContent = `${augmentKey.replace(/_/g, ' ')}: + ${augment.description}`;
            ul.appendChild(li);
            //on click, send to backend to add to user augments
            li.onclick = (event) => {
                apiCall('POST', '/api/db/rpc/add_augment', { user_id: userId, augment_key: augmentKey }).then(success => {
                    if (success) {
                        document.location.href = '/run';
                    } else {
                        alert('Failed to add augment. Please try again.');
                    }
                });
        }
    }});
    augmentsDiv.appendChild(ul);
}

function populateUserAugments(user) {
    const augmentsDiv = document.getElementById('userAugments');
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

function getRandomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}