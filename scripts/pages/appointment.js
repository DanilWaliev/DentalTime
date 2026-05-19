import { initBurgerMenu } from '../core.js';
import { bindAction } from '../components/cards.js';
import { renderAppointmentServices, renderAppointmentDoctors } from '../components/cards.js';
import { GetServices, GetDoctors, GetAppointmentCalendar } from '../data/data.js';
import { renderAppointmentCalendar } from '../components/calendar.js';

let AppointmentState = {
  service: null,
  doctor: null,
  date: null,
  time: null,
  patientName: null,
  patientNumber: null,
}

function init() {
  initBurgerMenu();
  const doctorsContainer = document.getElementById('appointment-doctors-container');
  const servicesContainer = document.getElementById('appointment-services-container');
  const calendarDaysContainer = document.getElementById('calendar-days-container');
  renderAppointmentDoctors(GetDoctors(), doctorsContainer);
  renderAppointmentServices(GetServices(), servicesContainer);
  renderAppointmentCalendar(GetAppointmentCalendar(), calendarDaysContainer);
  
  bindAction(servicesContainer, 'select', handleSelectService);
  bindAction(doctorsContainer, 'select', handleSelectDoctor);
}

function handleSelectService(serviceId) {
  AppointmentState.service = serviceId;
  alert(serviceId);
}

function handleSelectDoctor(doctorId) {
  AppointmentState.doctor = doctorId;
  alert(doctorId);
}

function handleSelectDate() {

}

function handleSelectTime() {

}

function handleSubmit() {

}

document.addEventListener('DOMContentLoaded', init);
