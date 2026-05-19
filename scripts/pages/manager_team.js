import { initBurgerMenu } from '../core.js';
import { GetDoctors } from './../data/data.js';
import { renderManagerDoctors } from './../components/cards.js';

function init() {
    initBurgerMenu();
    renderManagerDoctors(GetDoctors(), document.getElementById('manager-doctors-container'));
}

document.addEventListener('DOMContentLoaded', init);
