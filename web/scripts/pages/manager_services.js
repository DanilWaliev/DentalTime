import { initBurgerMenu } from '../core.js';
import { GetServices, AddService, ApiUpdateService, ApiDeleteService, ApiAddService } from '../data/data.js';
import { renderManagerServices, bindAction } from '../components/cards.js';
import { showConfirm, showInfo, showServiceModal } from '../components/modal.js';

let servicesContainer = null;

function init() {
    initBurgerMenu();

    servicesContainer = document.getElementById('manager-services-container');
    renderServicesList();

    bindAction(servicesContainer, 'edit', handleEditService);
    bindAction(servicesContainer, 'delete', handleDeleteService);

    const addBtn = document.getElementById('add-service-btn');
    if (addBtn) {
        addBtn.addEventListener('click', handleAddService);
    }
}

function renderServicesList() {
    renderManagerServices(GetServices(), servicesContainer);
}

function handleEditService(serviceId) {
    const service = findService(serviceId);
    if (!service) return;

    showServiceModal("Изменение услуги", (updatedData) => {
        Object.assign(service, updatedData);
        ApiUpdateService(serviceId, updatedData);
        renderServicesList();
        showSuccess("Услуга обновлена.");
    }, service);
}

function handleDeleteService(serviceId) {
    const service = findService(serviceId);
    if (!service) return;

    showConfirm(
        "Удаление услуги",
        `Вы уверены, что хотите удалить услугу "${service.title}"?`,
        () => {
            const services = GetServices();
            const serviceIndex = services.findIndex(item => String(item.id) === String(serviceId));

            if (serviceIndex === -1) return;

            services.splice(serviceIndex, 1);
            ApiDeleteService(serviceId);
            renderServicesList();
            showSuccess("Услуга удалена.");
        }
    );
}

function handleAddService() {
    showServiceModal("Добавление услуги", (newServiceData) => {
        const newService = {
            id: getNextServiceId(),
            ...newServiceData
        };

        AddService(newService);
        ApiAddService(newService);
        renderServicesList();
        showSuccess("Услуга добавлена.");
    });
}

function findService(serviceId) {
    return GetServices().find(service => String(service.id) === String(serviceId));
}

function getNextServiceId() {
    return GetServices().reduce((maxId, service) => Math.max(maxId, service.id), 0) + 1;
}

function showSuccess(message) {
    setTimeout(() => showInfo("Успех", message), 0);
}

document.addEventListener('DOMContentLoaded', init);
