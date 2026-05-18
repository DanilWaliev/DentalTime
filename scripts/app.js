import * as UI from './ui.js';
import * as data from './data.js';

function initApp() {
  const currentPage = document.body.dataset.page;

  switch (currentPage) {
    case 'appointment':
      initAppointmentPage();
      break;
    case 'team':
      initTeamPage();
      break;
    case 'services':
      initServicesPage();
      break;
    case 'status':
      initStatusPage();
      break;
    case 'login':
      break;
    case 'manager-schedule':
      break;
    case 'manager-appointments':
      initManagerAppointmentsPage();
      break;
    case 'manager-team':
      initManagerTeamPage();
      break;
    case 'manager-services':
      initManagerServicesPage();
      break;
  }
}

function initAppointmentPage() {
  // Logic for step-by-step appointment can be added here
}

function initTeamPage() {
  UI.renderDoctors(data.GetDoctors(), document.getElementById('doctors-container'));
}

function initServicesPage() {
  UI.renderServices(data.GetServices(), document.getElementById('services-container'));
}

function initManagerAppointmentsPage() {
  UI.renderAppointments(data.GetAppointments(), document.getElementById('appointments-container'));
}

function initManagerTeamPage() {
  UI.renderManagerDoctors(data.GetDoctors(), document.getElementById('manager-doctors-container'));
}

function initManagerServicesPage() {
  UI.renderManagerServices(data.GetServices(), document.getElementById('manager-services-container'));
}

function initStatusPage() {
  const statusCard = document.getElementById('status-card');
  if (statusCard) {
    // For demo purposes, render the first appointment
    UI.renderAppointmentStatus(data.GetAppointments()[0], statusCard);
  }
}

// TODO: рендер для таблицы записей (менеджер), ренд

document.addEventListener('DOMContentLoaded', initApp);