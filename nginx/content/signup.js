import { apiCall } from './api.js'

const button = document.getElementById('signUpButton');
button.onclick = (event) => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password_confirm').value;
    const termsCheckbox = document.getElementById('termsCheckbox');

    if (!termsCheckbox.checked) {
        alert("You must agree to the terms to sign up.");
        return;
    }
    if (password !== passwordConfirm) {
        alert("Passwords do not match!");
        return;
    }
    if (username === '' || password === '') {
        return;
    }
    const requestBody = {
        signup_username: username,
        signup_password: password,
    };
    apiCall('POST', '/api/db/rpc/signup', requestBody).then(success => {
        if (success) {
            alert("Signup successful! Please log in.");
            document.location.href = '/login';
        }
    });
}