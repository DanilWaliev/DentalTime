import { initBurgerMenu } from '../core.js';
import { GetServices } from './../data/data.js';
import { renderManagerServices } from './../components/cards.js';

function init() {
    initBurgerMenu();
    renderManagerServices(GetServices(), document.getElementById('manager-services-container'));
}

document.addEventListener('DOMContentLoaded', init);
