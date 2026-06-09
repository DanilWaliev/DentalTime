import { initBurgerMenu } from '../core.js';
import { GetAppointments, GetDoctors, GetServices, ApiAddManagerAppointment, ApiUpdateAppointment, ApiDeleteAppointment, loadAppData } from './../data/data.js';
import { bindAction, renderAppointments } from './../components/cards.js';
import { showAddAppointmentModal, showConfirm, showInfo } from '../components/modal.js';

let appointmentsContainer = null;

async function init() {
  initBurgerMenu();

  appointmentsContainer = document.getElementById('appointments-container');
  await loadAppData();
  renderAppointmentsList();

  bindAction(appointmentsContainer, 'edit', (appointmentId) => handleEditAppointment(appointmentId));
  bindAction(appointmentsContainer, 'delete', (appointmentId) => handleDeleteAppointment(appointmentId));
  bindAction(appointmentsContainer, 'confirm', (appointmentId) => handleConfirmAppointment(appointmentId));

  const addBtn = document.getElementById('add-appointment-btn');
  if (addBtn) {
    addBtn.addEventListener('click', handleAddAppointment);
  }
}

function renderAppointmentsList() {
  renderAppointments(GetAppointments(), appointmentsContainer);
}

function handleAddAppointment() {
  showAddAppointmentModal('Добавление новой записи', (newAppointment) => {
    const isComplete = newAppointment.patientName &&
      newAppointment.service.id &&
      newAppointment.service.title &&
      newAppointment.doctor.id &&
      newAppointment.doctor.fullName &&
      newAppointment.patientNumber &&
      newAppointment.date;

    if (!isComplete) {
      showInfo('Ошибка', 'Данные записи неполные. Пожалуйста, заполните все поля в форме.');
      return;
    }

    void (async () => {
      await ApiAddManagerAppointment({
        patientName: newAppointment.patientName,
        patientNumber: newAppointment.patientNumber,
        service: newAppointment.service,
        doctor: newAppointment.doctor,
        date: newAppointment.date,
      });
      renderAppointmentsList();
      showSuccess('Запись добавлена.');
    })().catch(() => showInfo('Ошибка', 'Не удалось добавить запись.'));
  }, null, GetDoctors(), GetServices());
}

function handleEditAppointment(appointmentId) {
  const appointment = findAppointment(appointmentId);
  if (!appointment) return;

  showAddAppointmentModal('Изменение записи', (updatedData) => {
    void (async () => {
      const updatedAppointment = {
        patientName: updatedData.patientName,
        patientNumber: updatedData.patientNumber,
        service: updatedData.service,
        doctor: updatedData.doctor,
        date: updatedData.date,
        status: updatedData.status
      };

      await ApiUpdateAppointment(appointmentId, updatedAppointment);
      renderAppointmentsList();
      showSuccess('Запись обновлена.');
    })().catch(() => showInfo('Ошибка', 'Не удалось обновить запись.'));
  }, appointment, GetDoctors(), GetServices(), null, true);
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
        renderAppointmentsList();
        showSuccess('Запись удалена.');
      })().catch(() => showInfo('Ошибка', 'Не удалось удалить запись.'));
    }
  );
}

function handleConfirmAppointment(appointmentId) {
  const appointment = findAppointment(appointmentId);
  if (!appointment) return;

  const updatedData = {
    status: 'Подтверждена'
  };

  void (async () => {
    await ApiUpdateAppointment(appointmentId, updatedData);
    renderAppointmentsList();
    showSuccess('Запись подтверждена.');
  })().catch(() => showInfo('Ошибка', 'Не удалось подтвердить запись.'));
}

function findAppointment(appointmentId) {
  return GetAppointments().find(appointment => String(appointment.id) === String(appointmentId));
}

function showSuccess(message) {
  setTimeout(() => showInfo('Успех', message), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
