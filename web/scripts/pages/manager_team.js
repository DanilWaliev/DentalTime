import { initBurgerMenu } from '../core.js';
import { GetDoctors, GetManagers, ApiUpdateDoctor, ApiDeleteDoctor, ApiAddDoctor, ApiAddManager, ApiDeleteManager, loadAppData, loadManagers } from './../data/data.js';
import { renderManagerDoctors, bindAction } from './../components/cards.js';
import { showConfirm, showDoctorModal, showInfo } from '../components/modal.js';

let doctorsContainer = null;
let managersContainer = null;

async function init() {
  initBurgerMenu();

  doctorsContainer = document.getElementById('manager-doctors-container');
  managersContainer = document.getElementById('manager-users-container');
  await loadAppData();
  await loadManagers();
  renderDoctorsList();
  renderManagersList();

  bindAction(doctorsContainer, 'edit', (doctorId) => handleEditDoctor(doctorId));
  bindAction(doctorsContainer, 'delete', (doctorId) => handleDeleteDoctor(doctorId));
  bindAction(managersContainer, 'delete-manager', (managerId) => handleDeleteManager(managerId));

  const addBtn = document.getElementById('add-doctor-btn');
  if (addBtn) {
    addBtn.addEventListener('click', handleAddDoctor);
  }

  const addManagerBtn = document.getElementById('add-manager-btn');
  if (addManagerBtn) {
    addManagerBtn.addEventListener('click', handleAddManager);
  }
}

function renderDoctorsList() {
  renderManagerDoctors(GetDoctors(), doctorsContainer);
}

function renderManagersList() {
  const managers = GetManagers();
  managersContainer.innerHTML = managers.map(manager => `
    <div class="card manager-card">
      <div class="manager-login">${manager.login}</div>
      <button class="btn btn-outline btn-sm text-danger" data-action="delete-manager" data-id="${manager.id}">Удалить</button>
    </div>
  `).join('');
}

function handleEditDoctor(doctorId) {
  const doctor = findDoctor(doctorId);
  if (!doctor) return;

  showDoctorModal('Изменение врача', (updatedData) => {
    void (async () => {
      const doctorData = prepareDoctorData(updatedData);
      await ApiUpdateDoctor(doctorId, doctorData);
      renderDoctorsList();
      showSuccess('Данные врача сохранены.');
    })();
  }, doctor);
}

function handleDeleteDoctor(doctorId) {
  const doctor = findDoctor(doctorId);
  if (!doctor) return;

  showConfirm(
    'Удаление врача',
    `Вы уверены, что хотите удалить врача ${doctor.fullName}?`,
    () => {
      void (async () => {
        await ApiDeleteDoctor(doctorId);
        renderDoctorsList();
        showSuccess('Врач удален.');
      })();
    }
  );
}

function handleAddDoctor() {
  showDoctorModal('Добавление врача', (newDoctorData) => {
    void (async () => {
      const doctorData = prepareDoctorData(newDoctorData);
      await ApiAddDoctor(doctorData);
      renderDoctorsList();
      showSuccess('Врач добавлен.');
    })();
  });
}

function handleAddManager() {
  const loginInput = document.getElementById('manager-login');
  const passwordInput = document.getElementById('manager-password');
  const login = loginInput ? loginInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!login || !password) {
    showSuccess('Заполните логин и пароль.');
    return;
  }

  void (async () => {
    await ApiAddManager({ login, password });
    loginInput.value = '';
    passwordInput.value = '';
    renderManagersList();
    showSuccess('Менеджер добавлен.');
  })();
}

function handleDeleteManager(managerId) {
  const manager = GetManagers().find(item => String(item.id) === String(managerId));
  if (!manager) return;

  showConfirm(
    'Удаление менеджера',
    `Удалить менеджера ${manager.login}?`,
    () => {
      void (async () => {
        await ApiDeleteManager(managerId);
        renderManagersList();
        showSuccess('Менеджер удален.');
      })();
    }
  );
}

function findDoctor(doctorId) {
  return GetDoctors().find(doctor => String(doctor.id) === String(doctorId));
}

function prepareDoctorData(doctorData) {
  const { photoFile, photoPreviewUrl, ...data } = doctorData;

  if (photoFile && photoPreviewUrl) {
    data.photoFile = photoFile;
  }

  return data;
}

function showSuccess(message) {
  setTimeout(() => showInfo('Успех', message), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
