import { initBurgerMenu } from '../core.js';
import { GetAppointments, ApiAddManagerAppointment, ApiUpdateAppointment, ApiDeleteAppointment } from './../data/data.js';
import { renderAppointments, bindAction } from './../components/cards.js';
import { showAddAppointmentModal, showInfo, showConfirm } from '../components/modal.js';

let currentAppointments = [];

function init() {
    initBurgerMenu();
    currentAppointments = GetAppointments();
    const container = document.getElementById('appointments-container');
    renderAppointments(currentAppointments, container);

    const addBtn = document.getElementById('add-appointment-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => handleAddAppointment());
    }

    bindAction(container, 'edit', handleEditAppointment);
    bindAction(container, 'delete', handleDeleteAppointment);
}

function handleAddAppointment() {
    showAddAppointmentModal("Добавление новой записи", (newAppointment) => {
        const isComplete = newAppointment.patientName && 
                           newAppointment.service.title && 
                           newAppointment.doctor.fullName && 
                           newAppointment.date;

        if (!isComplete) {
            showInfo("Ошибка", "Данные записи неполные.");
            return;
        }

        ApiAddManagerAppointment(newAppointment);
    });
}

function handleEditAppointment(appointmentId) {
    const appointmentToEdit = currentAppointments.find(app => app.id.toString() === appointmentId);
    
    if (!appointmentToEdit) {
        showInfo("Ошибка", "Запись не найдена.");
        return;
    }

    showAddAppointmentModal("Редактирование записи", (updatedAppointment) => {
        const isComplete = updatedAppointment.patientName && 
                           updatedAppointment.service.title && 
                           updatedAppointment.doctor.fullName && 
                           updatedAppointment.date;

        if (!isComplete) {
            showInfo("Ошибка", "Данные записи неполные.");
            return;
        }

        ApiUpdateAppointment(appointmentId, updatedAppointment);
    }, null, appointmentToEdit);
}

function handleDeleteAppointment(appointmentId) {
    showConfirm(
        "Подтверждение удаления", 
        `Вы уверены, что хотите удалить запись №${appointmentId}? Это действие нельзя будет отменить.`,
        () => {
            ApiDeleteAppointment(appointmentId);
            // Тут обновление UI
        }
    );
}

document.addEventListener('DOMContentLoaded', init);
