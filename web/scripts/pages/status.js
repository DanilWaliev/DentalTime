import { initBurgerMenu } from '../core.js';
import { CancelAppointment, GetAppointmentByNumber, GetAppointments, RescheduleAppointment, loadAppData } from './../data/data.js';
import { bindAction, renderAppointmentStatus } from './../components/cards.js';
import { showConfirm, showInfo } from '../components/modal.js';

let currentAppointment = null;
let statusCard = null;
let searchInput = null;
let statusMessage = null;

async function init() {
  initBurgerMenu();

  statusCard = document.getElementById('status-card');
  searchInput = document.querySelector('.search-input');
  statusMessage = createStatusMessage();

  await loadAppData();
  renderCurrentAppointment(GetAppointments()[0]);

  const searchButton = document.querySelector('.status-search-box .btn');
  if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleSearch();
    });
  }

  bindAction(statusCard, 'cancel', (appointmentId) => handleCancel(appointmentId));
  bindAction(statusCard, 'reschedule', (appointmentId) => handleReschedule(appointmentId));
}

function createStatusMessage() {
  const message = document.createElement('div');
  message.className = 'status-message';
  message.setAttribute('role', 'status');

  const searchBox = document.querySelector('.status-search-box');
  if (searchBox) {
    searchBox.insertAdjacentElement('afterend', message);
  }

  return message;
}

function handleSearch() {
  if (!searchInput) return;

  const appointmentNumber = searchInput.value.trim();

  if (!appointmentNumber) {
    setMessage('Введите номер записи.', 'error');
    searchInput.focus();
    return;
  }

  const appointment = GetAppointmentByNumber(appointmentNumber);

  if (!appointment) {
    currentAppointment = null;
    statusCard.classList.add('is-hidden');
    setMessage(`Запись №${appointmentNumber} не найдена.`, 'error');
    return;
  }

  renderCurrentAppointment(appointment);
  setMessage(`Найдена запись №${appointment.num}.`, 'success');
}

function handleCancel(appointmentId) {
  const appointment = findAppointment(appointmentId);
  if (!appointment) return;

  if (appointment.status === 'Отменена') {
    showInfo('Запись уже отменена', 'Действия с отмененной записью недоступны.');
    return;
  }

  showConfirm(
    'Отмена записи',
    `Вы уверены, что хотите отменить запись №${appointment.num}?`,
    () => {
      void (async () => {
        const updatedAppointment = await CancelAppointment(appointmentId);
        renderCurrentAppointment(updatedAppointment);
        setMessage(`Запись №${updatedAppointment.num} отменена.`, 'success');
      })();
    }
  );
}

function handleReschedule(appointmentId) {
  const appointment = findAppointment(appointmentId);
  if (!appointment) return;

  if (appointment.status === 'Отменена') {
    showInfo('Запись отменена', 'Перенести отмененную запись нельзя.');
    return;
  }

  showRescheduleDialog(appointment, (newDate) => {
    void (async () => {
      const updatedAppointment = await RescheduleAppointment(appointmentId, newDate);
      renderCurrentAppointment(updatedAppointment);
      setMessage(`Запись №${updatedAppointment.num} перенесена.`, 'success');
    })();
  });
}

function showRescheduleDialog(appointment, onConfirm) {
  const dialog = document.createElement('dialog');
  dialog.className = 'app-modal modal-form';

  dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">Перенос записи №${appointment.num}</h3>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label" for="reschedule-date">Новая дата и время</label>
                    <input type="datetime-local" class="form-input" id="reschedule-date" value="${formatDateTimeInputValue(appointment.date)}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline btn-sm" data-action="cancel">Отмена</button>
                <button class="btn btn-primary btn-sm" data-action="submit">Перенести</button>
            </div>
        </div>
    `;

  document.body.appendChild(dialog);
  dialog.showModal();

  const closeModal = () => {
    dialog.close();
    dialog.remove();
  };

  dialog.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);
  dialog.querySelector('[data-action="submit"]').addEventListener('click', () => {
    const dateInput = dialog.querySelector('#reschedule-date');
    const value = dateInput.value;

    dateInput.style.borderColor = '';

    if (!value) {
      dateInput.style.borderColor = 'var(--color-error, #ff4d4d)';
      return;
    }

    onConfirm(`${value}:00+03:00`);
    closeModal();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeModal();
  });
}

function renderCurrentAppointment(appointment) {
  if (!appointment || !statusCard) return;

  currentAppointment = appointment;
  statusCard.classList.remove('is-hidden');
  renderAppointmentStatus(appointment, statusCard);
}

function findAppointment(appointmentId) {
  if (currentAppointment && String(currentAppointment.id) === String(appointmentId)) {
    return currentAppointment;
  }

  return GetAppointments().find(appointment => String(appointment.id) === String(appointmentId));
}

function setMessage(text, type = '') {
  if (!statusMessage) return;

  statusMessage.textContent = text;
  statusMessage.className = `status-message ${type ? `status-message-${type}` : ''}`;
}

function formatDateTimeInputValue(dateString) {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
