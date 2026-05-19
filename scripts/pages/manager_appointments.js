import { initBurgerMenu } from '../core.js';
import { GetAppointments } from './../data/data.js';
import { renderAppointments } from './../components/cards.js';

function init() {
    initBurgerMenu();
    renderAppointments(GetAppointments(), document.getElementById('appointments-container'));
}

document.addEventListener('DOMContentLoaded', init);
