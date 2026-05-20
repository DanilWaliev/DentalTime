import { initBurgerMenu } from '../core.js';
import { GetAppointments } from './../data/data.js';
import { renderAppointments } from './../components/cards.js';
import { showAddAppointmentModal } from '../components/modal.js';

function init() {
    initBurgerMenu();
    renderAppointments(GetAppointments(), document.getElementById('appointments-container'));

    const addBtn = document.getElementById('add-appointment-btn');
    if (addBtn) {
        addBtn.addEventListener('click', handleAddAppointment);
    }
}

function handleAddAppointment() {
    showAddAppointmentModal("Добавление новой записи", (newAppointment) => {
        console.log("Новая запись для добавления:", newAppointment);
    });
}

document.addEventListener('DOMContentLoaded', init);
