import { initBurgerMenu } from '../core.js';
import { GetAppointments, ApiAddManagerAppointment, ApiUpdateAppointment, ApiDeleteAppointment } from './../data/data.js';
import { bindAction, renderAppointments } from './../components/cards.js';
import { showAddAppointmentModal, showConfirm, showInfo } from '../components/modal.js';

let appointmentsContainer = null;

function init() {
    initBurgerMenu();

    appointmentsContainer = document.getElementById('appointments-container');
    renderAppointmentsList();

    bindAction(appointmentsContainer, 'edit', handleEditAppointment);
    bindAction(appointmentsContainer, 'delete', handleDeleteAppointment);
    bindAction(appointmentsContainer, 'confirm', handleConfirmAppointment);

    const addBtn = document.getElementById('add-appointment-btn');
    if (addBtn) {
        addBtn.addEventListener('click', handleAddAppointment);
    }
}

function renderAppointmentsList() {
    renderAppointments(GetAppointments(), appointmentsContainer);
}

function handleAddAppointment() {
    showAddAppointmentModal("Добавление новой записи", (newAppointment) => {
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

function handleEditAppointment(appointmentId) {
    const appointment = findAppointment(appointmentId);
    if (!appointment) return;

    showAddAppointmentModal("Изменение записи", (updatedData) => {
        const statusSelect = document.getElementById('edit-appointment-status');
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
            date: updatedData.date,
            status: statusSelect ? statusSelect.value : appointment.status
        };

        Object.assign(appointment, updatedAppointment);
        ApiUpdateAppointment(appointmentId, updatedAppointment);
        renderAppointmentsList();
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
            renderAppointmentsList();
            showSuccess("Запись удалена.");
        }
    );
}

function handleConfirmAppointment(appointmentId) {
    const appointment = findAppointment(appointmentId);
    if (!appointment) return;

    const updatedData = {
        status: "Подтверждена"
    };

    Object.assign(appointment, updatedData);
    ApiUpdateAppointment(appointmentId, updatedData);
    renderAppointmentsList();
    showSuccess("Запись подтверждена.");
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
    const modalBody = dialog.querySelector('.modal-body');

    patientNameInput.value = appointment.patientName;
    serviceTitleInput.value = appointment.service.title;
    doctorNameInput.value = appointment.doctor.fullName;
    appointmentDateInput.value = formatDateTimeInputValue(appointment.date);

    if (modalBody) {
        modalBody.insertAdjacentHTML('beforeend', `
            <div class="form-group">
                <label class="form-label" for="edit-appointment-status">Статус</label>
                <select class="form-input" id="edit-appointment-status">
                    <option value="Ожидает">Ожидает</option>
                    <option value="Подтверждена">Подтверждена</option>
                    <option value="Отменена">Отменена</option>
                </select>
            </div>
        `);

        dialog.querySelector('#edit-appointment-status').value = appointment.status;
    }

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
