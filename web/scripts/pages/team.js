import { initBurgerMenu } from '../core.js';
import { GetDoctors } from './../data/data.js';
import { renderDoctors } from './../components/cards.js';

function init() {
    initBurgerMenu();
    renderDoctors(GetDoctors(), document.getElementById('doctors-container'));
}

document.addEventListener('DOMContentLoaded', init);
