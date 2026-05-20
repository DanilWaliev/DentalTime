import { initBurgerMenu } from '../core.js';
import { GetDoctors, ApiUpdateDoctor, ApiDeleteDoctor, ApiAddDoctor } from './../data/data.js';
import { renderManagerDoctors, bindAction } from './../components/cards.js';
import { showConfirm, showInfo } from '../components/modal.js';

function init() {
    initBurgerMenu();
    const container = document.getElementById('manager-doctors-container');
    renderManagerDoctors(GetDoctors(), container);

    // Биндим кнопки внутри карточек
    bindAction(container, 'save', handleSaveDoctor);
    bindAction(container, 'delete', handleDeleteDoctor);

    // Биндим кнопку добавления (если добавим ID в HTML)
    const addBtn = document.getElementById('add-doctor-btn');
    if (addBtn) {
        addBtn.addEventListener('click', handleAddDoctor);
    }
}

function handleSaveDoctor(doctorId) {
    const card = document.querySelector(`.card[data-id="${doctorId}"]`);
    if (!card) return;

    // Собираем данные из инпутов внутри карточки
    const inputs = card.querySelectorAll('.form-input');
    const updatedData = {
        fullName: inputs[0].value,
        spec: inputs[1].value,
        experience: inputs[2].value,
        services: inputs[3].value.split(',').map(s => s.trim())
    };

    ApiUpdateDoctor(doctorId, updatedData);
    showInfo("Успех", "Данные врача сохранены.");
}

function handleDeleteDoctor(doctorId) {
    showConfirm(
        "Удаление врача",
        `Вы уверены, что хотите удалить врача с ID ${doctorId}?`,
        () => {
            ApiDeleteDoctor(doctorId);
        }
    );
}

function handleAddDoctor() {
    // Здесь могла бы быть модалка showAddDoctorModal
    console.log("Логика добавления врача");
}

document.addEventListener('DOMContentLoaded', init);
