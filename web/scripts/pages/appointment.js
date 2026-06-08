import { initBurgerMenu } from '../core.js';
import { bindAction, selectCard, renderAppointmentDoctors, renderAppointmentServices } from '../components/cards.js';
import { renderAppointmentCalendar, selectDay, renderAppointmentTimeSlots, selectTimeSlot } from '../components/calendar.js';
import { initSlider } from '../components/slider.js';
import { GetPhoneAndName, showInfo } from '../components/modal.js';
import {
  ApiCreateAppointment,
  GetAppointmentCalendar,
  GetAppointmentTimeSlots,
  GetDoctors,
  GetServices,
  loadAppData,
  loadDoctorAvailability,
  loadDoctorSlots,
} from '../data/data.js';

let AppointmentState = {
  service: null,
  doctor: null,
  date: null,
  time: null,
  patientName: null,
  patientNumber: null,
};

async function init() {
  initBurgerMenu();

  const doctorsContainer = document.getElementById('appointment-doctors-container');
  const servicesContainer = document.getElementById('appointment-services-container');
  const calendarDaysContainer = document.getElementById('calendar-days-container');
  const timeSlotsContainer = document.getElementById('appointment-time-slots-container');
  const submitButton = document.getElementById('submit-button');

  await loadAppData();

  renderAppointmentDoctors(GetDoctors(), doctorsContainer);
  renderAppointmentServices(GetServices(), servicesContainer);

  initSlider(servicesContainer);
  initSlider(doctorsContainer);

  bindAction(servicesContainer, 'select', (serviceId) => handleSelectService(serviceId));
  bindAction(doctorsContainer, 'select', (doctorId) => {
    void handleSelectDoctor(doctorId, calendarDaysContainer, timeSlotsContainer);
  });
  bindAction(calendarDaysContainer, 'select', (dayId) => {
    void handleSelectDate(dayId, calendarDaysContainer, timeSlotsContainer);
  });
  bindAction(timeSlotsContainer, 'select-time', (timeId) => handleSelectTime(timeId));

  if (submitButton) {
    submitButton.addEventListener('click', handleSubmit);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedDoctorId = urlParams.get('doctorId');
  const preselectedServiceId = urlParams.get('serviceId');

  if (preselectedDoctorId) {
    AppointmentState.doctor = preselectedDoctorId;
  } else if (GetDoctors()[0]) {
    AppointmentState.doctor = String(GetDoctors()[0].id);
  }

  if (preselectedServiceId) {
    AppointmentState.service = preselectedServiceId;
  } else if (GetServices()[0]) {
    AppointmentState.service = String(GetServices()[0].id);
  }

  if (AppointmentState.doctor) {
    await loadDoctorAvailability(AppointmentState.doctor);
    renderAppointmentCalendar(GetAppointmentCalendar(), calendarDaysContainer);
    renderAppointmentTimeSlots(GetAppointmentTimeSlots(), timeSlotsContainer);
    applyInitialSelection(calendarDaysContainer, timeSlotsContainer);
    selectCard(AppointmentState.doctor, doctorsContainer);
  }

  if (AppointmentState.service) {
    selectCard(AppointmentState.service, servicesContainer);
  }
}

function handleSelectService(serviceId) {
  AppointmentState.service = serviceId;
  const servicesContainer = document.getElementById('appointment-services-container');
  selectCard(serviceId, servicesContainer);
}

async function handleSelectDoctor(doctorId, calendarDaysContainer, timeSlotsContainer) {
  AppointmentState.doctor = doctorId;
  const doctorsContainer = document.getElementById('appointment-doctors-container');
  selectCard(doctorId, doctorsContainer);

  await loadDoctorAvailability(doctorId, AppointmentState.date);
  renderAppointmentCalendar(GetAppointmentCalendar(), calendarDaysContainer);
  renderAppointmentTimeSlots(GetAppointmentTimeSlots(), timeSlotsContainer);
  applyInitialSelection(calendarDaysContainer, timeSlotsContainer);
}

async function handleSelectDate(dayId, calendarDaysContainer, timeSlotsContainer) {
  if (!AppointmentState.doctor) return;

  AppointmentState.date = dayId;
  selectDay({ date: dayId }, calendarDaysContainer);

  await loadDoctorSlots(AppointmentState.doctor, dayId);
  renderAppointmentTimeSlots(GetAppointmentTimeSlots(), timeSlotsContainer);
  applySlotSelection(timeSlotsContainer);
}

function handleSelectTime(timeId) {
  AppointmentState.time = timeId;
  const timeSlotsContainer = document.getElementById('appointment-time-slots-container');
  selectTimeSlot({ time: timeId }, timeSlotsContainer);
}

async function handleSubmit() {
  const missing = [];
  if (!AppointmentState.service) missing.push('услугу');
  if (!AppointmentState.doctor) missing.push('врача');
  if (!AppointmentState.date) missing.push('дату');
  if (!AppointmentState.time) missing.push('время');

  if (missing.length > 0) {
    showInfo('Недостаточно данных', `Пожалуйста, выберите: ${missing.join(', ')}.`);
    return;
  }

  GetPhoneAndName('Оставьте контакты для связи', async (userData) => {
    AppointmentState.patientName = userData.name;
    AppointmentState.patientNumber = userData.phone;
    await ApiCreateAppointment(AppointmentState);
  });
}

function applyInitialSelection(calendarDaysContainer, timeSlotsContainer) {
  const selectedDay = GetAppointmentCalendar().find(day => day.status === 'selected') || GetAppointmentCalendar().find(day => day.status === 'available');
  if (selectedDay) {
    AppointmentState.date = selectedDay.date;
    selectDay({ date: selectedDay.date }, calendarDaysContainer);
  }

  applySlotSelection(timeSlotsContainer);
}

function applySlotSelection(timeSlotsContainer) {
  const selectedSlot = GetAppointmentTimeSlots().find(slot => slot.status === 'selected') || GetAppointmentTimeSlots().find(slot => slot.status === 'available');
  if (selectedSlot) {
    AppointmentState.time = selectedSlot.time;
    selectTimeSlot({ time: selectedSlot.time }, timeSlotsContainer);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
