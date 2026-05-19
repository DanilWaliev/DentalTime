import { renderAppointmentServices, renderAppointmentDoctors, renderAppointments } from '../components/cards.js';
import { GetServices, GetDoctors } from '../data/data.js';

renderAppointmentDoctors(GetDoctors(), document.getElementById('appointment-doctors-container'));
renderAppointmentServices(GetServices(), document.getElementById('appointment-services-container'));
