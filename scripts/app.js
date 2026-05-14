import * as UI from './ui.js';
import * as data from './data.js';

function initApp() {
  const currentPage = document.body.dataset.page;

  switch (currentPage) {
    case 'appointment':
      break;
    case 'team':
      initTeamPage();
      break;
    case 'services':
      break;
    case 'login':
      break;
    case 'manager-schedule':
      break;
    case 'manager-appointments':
      break;
    case 'manager-team':
      break;
    case 'manager-services':
      break;
  }

}

function initAppointmentPage() {

}

function initTeamPage() {
  UI.renderDoctors(data.GetDoctors(), document.getElementById('doctors-container'));
}

document.addEventListener('DOMContentLoaded', initApp);