import { initBurgerMenu } from '../core.js';
import { GetDoctors, ApiUpdateDoctor, ApiDeleteDoctor, ApiAddDoctor, ApiUploadDoctorPhoto, loadAppData } from './../data/data.js';
import { renderManagerDoctors, bindAction } from './../components/cards.js';
import { showConfirm, showDoctorModal, showInfo } from '../components/modal.js';

let doctorsContainer = null;

async function init() {
  initBurgerMenu();

  doctorsContainer = document.getElementById('manager-doctors-container');
  await loadAppData();
  renderDoctorsList();

  bindAction(doctorsContainer, 'edit', (doctorId) => handleEditDoctor(doctorId));
  bindAction(doctorsContainer, 'delete', (doctorId) => handleDeleteDoctor(doctorId));

  const addBtn = document.getElementById('add-doctor-btn');
  if (addBtn) {
    addBtn.addEventListener('click', handleAddDoctor);
  }
}

function renderDoctorsList() {
  renderManagerDoctors(GetDoctors(), doctorsContainer);
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

function findDoctor(doctorId) {
  return GetDoctors().find(doctor => String(doctor.id) === String(doctorId));
}

function prepareDoctorData(doctorData) {
  const { photoFile, photoPreviewUrl, ...data } = doctorData;

  if (photoFile && photoPreviewUrl) {
    data.photo = ApiUploadDoctorPhoto(photoFile, photoPreviewUrl);
  }

  return data;
}

function showSuccess(message) {
  setTimeout(() => showInfo('Успех', message), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
