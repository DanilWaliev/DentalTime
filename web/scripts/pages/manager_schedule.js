import { initBurgerMenu } from '../core.js';
import { GetAppointments, ApiUpdateAppointment, ApiDeleteAppointment, loadAppData } from './../data/data.js';
import { bindAction, renderSchedule } from './../components/cards.js';
import { showAddAppointmentModal, showConfirm, showInfo } from '../components/modal.js';

let scheduleGrid = null;

async function init() {
  initBurgerMenu();
  scheduleGrid = document.getElementById('schedule-grid');

  await loadAppData();
  renderScheduleGrid();
  bindAction(scheduleGrid, 'edit', (appointmentId) => handleEditAppointment(appointmentId));
  bindAction(scheduleGrid, 'delete', (appointmentId) => handleDeleteAppointment(appointmentId));
}

function renderScheduleGrid() {
  renderSchedule(GetAppointments(), scheduleGrid);
}

function handleEditAppointment(appointmentId) {
  const appointment = findAppointment(appointmentId);
  if (!appointment) return;

  showAddAppointmentModal('Изменение записи', (updatedData) => {
    void (async () => {
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

      await ApiUpdateAppointment(appointmentId, updatedAppointment);
      renderScheduleGrid();
      showSuccess('Запись обновлена.');
    })();
  });

  fillAppointmentModal(appointment);
}

function handleDeleteAppointment(appointmentId) {
  const appointment = findAppointment(appointmentId);
  if (!appointment) return;

  showConfirm(
    'Удаление записи',
    `Вы уверены, что хотите удалить запись №${appointment.num}?`,
    () => {
      void (async () => {
        await ApiDeleteAppointment(appointmentId);
        renderScheduleGrid();
        showSuccess('Запись удалена.');
      })();
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
    submitButton.textContent = 'Сохранить';
  }
}

function formatDateTimeInputValue(dateString) {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function showSuccess(message) {
  setTimeout(() => showInfo('Успех', message), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
