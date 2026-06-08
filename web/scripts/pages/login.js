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

async function handleSubmit(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    LoginState.username = usernameInput ? usernameInput.value : null;
    LoginState.password = passwordInput ? passwordInput.value : null;

    try {
        await ApiLogin(LoginState);
        window.location.href = '/manager/schedule';
    } catch (error) {
        alert('Неверный логин или пароль');
    }
}

document.addEventListener('DOMContentLoaded', init);

