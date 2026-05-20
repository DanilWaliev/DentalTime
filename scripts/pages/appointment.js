import { initBurgerMenu } from '../core.js';
import { bindAction, selectCard } from '../components/cards.js';
import { renderAppointmentServices, renderAppointmentDoctors } from '../components/cards.js';
import { GetServices, GetDoctors, GetAppointmentCalendar, GetAppointmentTimeSlots } from '../data/data.js';
import { renderAppointmentCalendar, selectDay, renderAppointmentTimeSlots, selectTimeSlot } from '../components/calendar.js';
import { initSlider } from '../components/slider.js';
import { GetPhoneAndName, showInfo } from '../components/modal.js';

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
  const timeSlotsContainer = document.getElementById('appointment-time-slots-container');
  const submitButton = document.getElementById('submit-button');

  renderAppointmentDoctors(GetDoctors(), doctorsContainer);
  renderAppointmentServices(GetServices(), servicesContainer);
  renderAppointmentCalendar(GetAppointmentCalendar(), calendarDaysContainer);
  renderAppointmentTimeSlots(GetAppointmentTimeSlots(), timeSlotsContainer);

  initSlider(servicesContainer);
  initSlider(doctorsContainer);

  bindAction(servicesContainer, 'select', handleSelectService);
  bindAction(doctorsContainer, 'select', handleSelectDoctor);
  bindAction(calendarDaysContainer, 'select', handleSelectDate);
  bindAction(timeSlotsContainer, 'select-time', handleSelectTime);
  submitButton.addEventListener('click', handleSubmit);

  // Проверка URL на наличие выбранного врача (переход со страницы Команда)
  const urlParams = new URLSearchParams(window.location.search);
  
  const preselectedDoctorId = urlParams.get('doctorId');
  if (preselectedDoctorId) {
    handleSelectDoctor(preselectedDoctorId);
  }

  const preselectedServiceId = urlParams.get('serviceId');
  if (preselectedServiceId) {
    handleSelectService(preselectedServiceId);
  }
}

function handleSelectService(serviceId) {
  AppointmentState.service = serviceId;
  const servicesContainer = document.getElementById('appointment-services-container');
  selectCard(serviceId, servicesContainer);
}

function handleSelectDoctor(doctorId) {
  AppointmentState.doctor = doctorId;
  const doctorsContainer = document.getElementById('appointment-doctors-container');
  selectCard(doctorId, doctorsContainer);
}

function handleSelectDate(dayId) {
  AppointmentState.date = dayId;
  const calendarDaysContainer = document.getElementById('calendar-days-container');
  selectDay({ date: dayId }, calendarDaysContainer);
}

function handleSelectTime(timeId) {
  AppointmentState.time = timeId;
  const timeSlotsContainer = document.getElementById('appointment-time-slots-container');
  selectTimeSlot({ time: timeId }, timeSlotsContainer);
}

function handleSubmit() {
  const missing = [];
  if (!AppointmentState.service) missing.push("услугу");
  if (!AppointmentState.doctor) missing.push("врача");
  if (!AppointmentState.date) missing.push("дату");
  if (!AppointmentState.time) missing.push("время");

  if (missing.length > 0) {
    showInfo("Недостаточно данных", `Пожалуйста, выберите: ${missing.join(", ")}.`);
    return;
  }

  GetPhoneAndName("Оставьте контакты для связи", (userData) => {
    AppointmentState.patientName = userData.name;
    AppointmentState.patientNumber = userData.phone;
    
    console.log("Запись сформирована:", AppointmentState);
  });
}

document.addEventListener('DOMContentLoaded', init);
