import { initBurgerMenu } from '../core.js';
import { renderAppointmentServices, renderAppointmentDoctors } from '../components/cards.js';
import { GetServices, GetDoctors } from '../data/data.js';

function init() {
    initBurgerMenu();
    renderAppointmentDoctors(GetDoctors(), document.getElementById('appointment-doctors-container'));
    renderAppointmentServices(GetServices(), document.getElementById('appointment-services-container'));
}

document.addEventListener('DOMContentLoaded', init);
