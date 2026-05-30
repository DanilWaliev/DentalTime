import { initBurgerMenu } from '../core.js';
import { ApiLogin } from '../data/data.js';

let LoginState = {
    username: null,
    password: null,
}

function init() {
    initBurgerMenu();

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleSubmit);
    }
}

function handleSubmit(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    LoginState.username = usernameInput ? usernameInput.value : null;
    LoginState.password = passwordInput ? passwordInput.value : null;

    ApiLogin(LoginState);
}

document.addEventListener('DOMContentLoaded', init);
