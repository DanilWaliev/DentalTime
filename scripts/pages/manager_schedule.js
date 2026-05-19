import { initBurgerMenu } from '../core.js';
import { GetAppointments } from './../data/data.js';
import { renderSchedule } from './../components/cards.js';

function init() {
    initBurgerMenu();
    const scheduleGrid = document.getElementById('schedule-grid');
    if (scheduleGrid) {
        renderSchedule(GetAppointments(), scheduleGrid);
    }
}

document.addEventListener('DOMContentLoaded', init);
