import { initBurgerMenu } from '../core.js';
import { GetAppointments, ApiAddManagerAppointment } from './../data/data.js';
import { renderAppointments } from './../components/cards.js';
import { showAddAppointmentModal, showInfo } from '../components/modal.js';

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
        // Проверка полноты данных перед обработкой
        const isComplete = newAppointment.patientName && 
                           newAppointment.service.title && 
                           newAppointment.doctor.fullName && 
                           newAppointment.date;

        if (!isComplete) {
            showInfo("Ошибка", "Данные записи неполные. Пожалуйста, заполните все поля в форме.");
            return;
        }

        ApiAddManagerAppointment(newAppointment);
    });
}

document.addEventListener('DOMContentLoaded', init);
