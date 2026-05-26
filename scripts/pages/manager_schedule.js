import { initBurgerMenu } from '../core.js';
import { GetAppointments, ApiUpdateAppointment, ApiDeleteAppointment } from './../data/data.js';
import { bindAction, renderSchedule } from './../components/cards.js';
import { showAddAppointmentModal, showConfirm, showInfo } from '../components/modal.js';

let scheduleGrid = null;

function init() {
    initBurgerMenu();
    scheduleGrid = document.getElementById('schedule-grid');

    renderScheduleGrid();
    bindAction(scheduleGrid, 'edit', handleEditAppointment);
    bindAction(scheduleGrid, 'delete', handleDeleteAppointment);
}

function renderScheduleGrid() {
    renderSchedule(GetAppointments(), scheduleGrid);
}

function handleEditAppointment(appointmentId) {
    const appointment = findAppointment(appointmentId);
    if (!appointment) return;

    showAddAppointmentModal("Изменение записи", (updatedData) => {
        const updatedAppointment = {
            patientName: updatedData.patientName,
            service: {
                ...appointment.service,
                title: updatedData.service.title
            },
            doctor: {
                ...appointment.doctor,
                fullName: updatedData.doctor.fullName
            },
            date: updatedData.date
        };

        Object.assign(appointment, updatedAppointment);
        ApiUpdateAppointment(appointmentId, updatedAppointment);
        renderScheduleGrid();
        showSuccess("Запись обновлена.");
    });

    fillAppointmentModal(appointment);
}

function handleDeleteAppointment(appointmentId) {
    const appointment = findAppointment(appointmentId);
    if (!appointment) return;

    showConfirm(
        "Удаление записи",
        `Вы уверены, что хотите удалить запись №${appointment.num}?`,
        () => {
            const appointments = GetAppointments();
            const appointmentIndex = appointments.findIndex(item => String(item.id) === String(appointmentId));

            if (appointmentIndex === -1) return;

            appointments.splice(appointmentIndex, 1);
            ApiDeleteAppointment(appointmentId);
            renderScheduleGrid();
            showSuccess("Запись удалена.");
        }
    );
}

function findAppointment(appointmentId) {
    return GetAppointments().find(appointment => String(appointment.id) === String(appointmentId));
}

function fillAppointmentModal(appointment) {
    const dialog = document.querySelector('.app-modal.modal-form');
    if (!dialog) return;

    const patientNameInput = dialog.querySelector('#new-patient-name');
    const serviceTitleInput = dialog.querySelector('#new-service-title');
    const doctorNameInput = dialog.querySelector('#new-doctor-name');
    const appointmentDateInput = dialog.querySelector('#new-appointment-date');
    const submitButton = dialog.querySelector('[data-action="submit"]');

    patientNameInput.value = appointment.patientName;
    serviceTitleInput.value = appointment.service.title;
    doctorNameInput.value = appointment.doctor.fullName;
    appointmentDateInput.value = formatDateTimeInputValue(appointment.date);

    if (submitButton) {
        submitButton.textContent = "Сохранить";
    }
}

function formatDateTimeInputValue(dateString) {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

function showSuccess(message) {
    setTimeout(() => showInfo("Успех", message), 0);
}

document.addEventListener('DOMContentLoaded', init);
