import { initBurgerMenu } from '../core.js';
import { GetAppointments, GetDoctors, GetServices, ApiUpdateAppointment, ApiDeleteAppointment, loadAppData } from './../data/data.js';
import { bindAction, renderSchedule } from './../components/cards.js';
import { showAddAppointmentModal, showConfirm, showInfo } from '../components/modal.js';

let scheduleGrid = null;
let selectedScheduleDate = null;
let dateCurrentElement = null;
let prevDateButton = null;
let nextDateButton = null;

async function init() {
  initBurgerMenu();
  scheduleGrid = document.getElementById('schedule-grid');
  dateCurrentElement = document.querySelector('.date-current span');
  prevDateButton = document.querySelector('.schedule-date .date-btn:first-child');
  nextDateButton = document.querySelector('.schedule-date .date-btn:last-child');

  await loadAppData();
  selectedScheduleDate = startOfDay(new Date());
  renderSelectedDate();
  renderScheduleGrid();
  bindAction(scheduleGrid, 'edit', (appointmentId) => handleEditAppointment(appointmentId));
  bindAction(scheduleGrid, 'delete', (appointmentId) => handleDeleteAppointment(appointmentId));

  if (prevDateButton) {
    prevDateButton.addEventListener('click', () => shiftScheduleDate(-1));
  }

  if (nextDateButton) {
    nextDateButton.addEventListener('click', () => shiftScheduleDate(1));
  }
}

function renderScheduleGrid() {
  const appointments = GetAppointments().filter(appointment => isSameDate(appointment.date, selectedScheduleDate));
  renderSchedule(appointments, scheduleGrid, GetDoctors());
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
      renderScheduleGrid();
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
        renderScheduleGrid();
        showSuccess('Запись удалена.');
      })().catch(() => showInfo('Ошибка', 'Не удалось удалить запись.'));
    }
  );
}

function findAppointment(appointmentId) {
  return GetAppointments().find(appointment => String(appointment.id) === String(appointmentId));
}

function showSuccess(message) {
  setTimeout(() => showInfo('Успех', message), 0);
}

function shiftScheduleDate(days) {
  const nextDate = new Date(selectedScheduleDate);
  nextDate.setDate(nextDate.getDate() + days);
  selectedScheduleDate = startOfDay(nextDate);
  renderSelectedDate();
  renderScheduleGrid();
}

function renderSelectedDate() {
  if (!dateCurrentElement || !selectedScheduleDate) return;

  dateCurrentElement.textContent = selectedScheduleDate.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isSameDate(dateString, date) {
  if (!dateString || !date) return false;

  const value = new Date(dateString);
  if (Number.isNaN(value.getTime())) return false;

  return value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth() &&
    value.getDate() === date.getDate();
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
