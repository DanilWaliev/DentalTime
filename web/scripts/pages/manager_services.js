import { initBurgerMenu } from '../core.js';
import { GetServices, ApiUpdateService, ApiDeleteService, ApiAddService, loadAppData } from '../data/data.js';
import { renderManagerServices, bindAction } from './../components/cards.js';
import { showConfirm, showInfo, showServiceModal } from '../components/modal.js';

let servicesContainer = null;

async function init() {
  initBurgerMenu();

  servicesContainer = document.getElementById('manager-services-container');
  await loadAppData();
  renderServicesList();

  bindAction(servicesContainer, 'edit', (serviceId) => handleEditService(serviceId));
  bindAction(servicesContainer, 'delete', (serviceId) => handleDeleteService(serviceId));

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

  showServiceModal('Изменение услуги', (updatedData) => {
    void (async () => {
      await ApiUpdateService(serviceId, updatedData);
      renderServicesList();
      showSuccess('Услуга обновлена.');
    })();
  }, service);
}

function handleDeleteService(serviceId) {
  const service = findService(serviceId);
  if (!service) return;

  showConfirm(
    'Удаление услуги',
    `Вы уверены, что хотите удалить услугу "${service.title}"?`,
    () => {
      void (async () => {
        await ApiDeleteService(serviceId);
        renderServicesList();
        showSuccess('Услуга удалена.');
      })();
    }
  );
}

function handleAddService() {
  showServiceModal('Добавление услуги', (newServiceData) => {
    void (async () => {
      await ApiAddService(newServiceData);
      renderServicesList();
      showSuccess('Услуга добавлена.');
    })();
  });
}

function findService(serviceId) {
  return GetServices().find(service => String(service.id) === String(serviceId));
}

function showSuccess(message) {
  setTimeout(() => showInfo('Успех', message), 0);
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
