import { initBurgerMenu } from '../core.js';
import { GetServices } from './../data/data.js';
import { renderServices } from './../components/cards.js';

function init() {
    initBurgerMenu();
    renderServices(GetServices(), document.getElementById('services-container'));
}

document.addEventListener('DOMContentLoaded', init);
