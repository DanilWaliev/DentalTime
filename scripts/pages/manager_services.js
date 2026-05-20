import { initBurgerMenu } from '../core.js';
import { GetServices, ApiUpdateService, ApiDeleteService, ApiAddService } from './../data/data.js';
import { renderManagerServices, bindAction } from './../components/cards.js';
import { showConfirm, showInfo } from '../components/modal.js';

function init() {
    initBurgerMenu();
    const container = document.getElementById('manager-services-container');
    renderManagerServices(GetServices(), container);

    // Биндим действия внутри карточек
    bindAction(container, 'save', handleSaveService);
    bindAction(container, 'delete', handleDeleteService);

    // Кнопка добавления
    const addBtn = document.getElementById('add-service-btn');
    if (addBtn) {
        addBtn.addEventListener('click', handleAddService);
    }
}

function handleSaveService(serviceId) {
    const card = document.querySelector(`.card[data-id="${serviceId}"]`);
    if (!card) return;

    const inputs = card.querySelectorAll('.form-input');
    const updatedData = {
        title: inputs[0].value,
        subtitle: inputs[1].value,
        duration: inputs[2].value,
        price: inputs[3].value
    };

    ApiUpdateService(serviceId, updatedData);
    showInfo("Успех", "Услуга обновлена.");
}

function handleDeleteService(serviceId) {
    showConfirm(
        "Удаление услуги",
        `Вы уверены, что хотите удалить услугу с ID ${serviceId}?`,
        () => {
            ApiDeleteService(serviceId);
        }
    );
}

function handleAddService() {
    console.log("Логика добавления услуги");
}

document.addEventListener('DOMContentLoaded', init);
