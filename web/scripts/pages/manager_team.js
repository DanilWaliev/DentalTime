import { initBurgerMenu } from '../core.js';
import { GetDoctors, AddDoctor, ApiUpdateDoctor, ApiDeleteDoctor, ApiAddDoctor, ApiUploadDoctorPhoto } from './../data/data.js';
import { renderManagerDoctors, bindAction } from './../components/cards.js';
import { showConfirm, showDoctorModal, showInfo } from '../components/modal.js';

let doctorsContainer = null;

function init() {
    initBurgerMenu();

    doctorsContainer = document.getElementById('manager-doctors-container');
    renderDoctorsList();

    bindAction(doctorsContainer, 'edit', handleEditDoctor);
    bindAction(doctorsContainer, 'delete', handleDeleteDoctor);

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

    showDoctorModal("Изменение врача", (updatedData) => {
        const doctorData = prepareDoctorData(updatedData);

        Object.assign(doctor, doctorData);
        ApiUpdateDoctor(doctorId, doctorData);
        renderDoctorsList();
        showSuccess("Данные врача сохранены.");
    }, doctor);
}

function handleDeleteDoctor(doctorId) {
    const doctor = findDoctor(doctorId);
    if (!doctor) return;

    showConfirm(
        "Удаление врача",
        `Вы уверены, что хотите удалить врача ${doctor.fullName}?`,
        () => {
            const doctors = GetDoctors();
            const doctorIndex = doctors.findIndex(item => String(item.id) === String(doctorId));

            if (doctorIndex === -1) return;

            doctors.splice(doctorIndex, 1);
            ApiDeleteDoctor(doctorId);
            renderDoctorsList();
            showSuccess("Врач удален.");
        }
    );
}

function handleAddDoctor() {
    showDoctorModal("Добавление врача", (newDoctorData) => {
        const newDoctor = {
            id: getNextDoctorId(),
            ...prepareDoctorData(newDoctorData)
        };

        AddDoctor(newDoctor);
        ApiAddDoctor(newDoctor);
        renderDoctorsList();
        showSuccess("Врач добавлен.");
    });
}

function findDoctor(doctorId) {
    return GetDoctors().find(doctor => String(doctor.id) === String(doctorId));
}

function getNextDoctorId() {
    return GetDoctors().reduce((maxId, doctor) => Math.max(maxId, doctor.id), 0) + 1;
}

function prepareDoctorData(doctorData) {
    const { photoFile, photoPreviewUrl, ...data } = doctorData;

    if (photoFile && photoPreviewUrl) {
        data.photo = ApiUploadDoctorPhoto(photoFile, photoPreviewUrl);
    }

    return data;
}

function showSuccess(message) {
    setTimeout(() => showInfo("Успех", message), 0);
}

document.addEventListener('DOMContentLoaded', init);
