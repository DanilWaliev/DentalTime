import { renderAppointmentServices, renderAppointmentDoctors } from '../components/cards.js';
import { GetServices, GetDoctors } from '../data/data.js';

function initAppointmentPage() {
  const servicesContainer = document.getElementById('appointment-services-container');
  const doctorsContainer = document.getElementById('appointment-doctors-container');

  if (servicesContainer) {
    renderAppointmentServices(GetServices(), servicesContainer);
  }

  if (doctorsContainer) {
    renderAppointmentDoctors(GetDoctors(), doctorsContainer);
  }
}

document.addEventListener('DOMContentLoaded', initAppointmentPage);
