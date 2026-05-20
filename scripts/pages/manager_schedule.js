import { initBurgerMenu } from '../core.js';
import { GetAppointments, ApiUpdateAppointment, ApiDeleteAppointment } from './../data/data.js';
import { renderSchedule, bindAction } from './../components/cards.js';
import { showAddAppointmentModal, showConfirm, showInfo } from '../components/modal.js';

let currentAppointments = [];

function init() {
    initBurgerMenu();
    currentAppointments = GetAppointments();
    const scheduleGrid = document.getElementById('schedule-grid');
    if (scheduleGrid) {
        renderSchedule(currentAppointments, scheduleGrid);
        
        // Биндим действия для карточек в расписании
        bindAction(scheduleGrid, 'edit', handleEditAppointment);
        bindAction(scheduleGrid, 'delete', handleDeleteAppointment);
    }
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
        }
    );
}

document.addEventListener('DOMContentLoaded', init);
