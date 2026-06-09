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

let doctorsContainer = null;
let servicesContainer = null;
let calendarDaysContainer = null;
let timeSlotsContainer = null;

async function init() {
  initBurgerMenu();

  doctorsContainer = document.getElementById('appointment-doctors-container');
  servicesContainer = document.getElementById('appointment-services-container');
  calendarDaysContainer = document.getElementById('calendar-days-container');
  timeSlotsContainer = document.getElementById('appointment-time-slots-container');
  const submitButton = document.getElementById('submit-button');

  await loadAppData();

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedDoctorId = urlParams.get('doctorId');
  const preselectedServiceId = urlParams.get('serviceId');

  if (preselectedDoctorId && findDoctorById(preselectedDoctorId)) {
    AppointmentState.doctor = preselectedDoctorId;
  }

  if (preselectedServiceId && findServiceById(preselectedServiceId)) {
    AppointmentState.service = preselectedServiceId;
  }

  await refreshSelection();

  initSlider(servicesContainer);
  initSlider(doctorsContainer);

  bindAction(servicesContainer, 'select', (serviceId) => {
    void handleSelectService(serviceId);
  });
  bindAction(doctorsContainer, 'select', (doctorId) => {
    void handleSelectDoctor(doctorId);
  });
  bindAction(calendarDaysContainer, 'select', (dayId) => {
    void handleSelectDate(dayId);
  });
  bindAction(timeSlotsContainer, 'select-time', (timeId) => handleSelectTime(timeId));

  if (submitButton) {
    submitButton.addEventListener('click', handleSubmit);
  }
}

async function handleSelectService(serviceId) {
  AppointmentState.service = serviceId;
  AppointmentState.date = null;
  AppointmentState.time = null;
  await refreshSelection('service');
}

async function handleSelectDoctor(doctorId) {
  AppointmentState.doctor = doctorId;
  AppointmentState.date = null;
  AppointmentState.time = null;
  await refreshSelection('doctor');
}

async function handleSelectDate(dayId) {
  if (!AppointmentState.doctor) return;

  AppointmentState.date = dayId;
  selectDay({ date: dayId }, calendarDaysContainer);

  await loadDoctorSlots(AppointmentState.doctor, dayId);
  renderAppointmentTimeSlots(GetAppointmentTimeSlots(), timeSlotsContainer);
  applySlotSelection();
}

function handleSelectTime(timeId) {
  AppointmentState.time = timeId;
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
    try {
      AppointmentState.patientName = userData.name;
      AppointmentState.patientNumber = userData.phone;
      const created = await ApiCreateAppointment(AppointmentState);
      showInfo('Успех', `Запись создана. Номер записи: ${created.num}. Сохраните его.`);
    } catch (error) {
      showInfo('Ошибка', error && error.message ? error.message : 'Не удалось создать запись.');
    }
  });
}

async function refreshSelection(preferredSource = '') {
  normalizeState();
  resolveDefaults(preferredSource);
  renderFilteredContainers();

  if (AppointmentState.doctor) {
    await loadDoctorAvailability(AppointmentState.doctor, AppointmentState.date);
    renderAppointmentCalendar(GetAppointmentCalendar(), calendarDaysContainer);
    renderAppointmentTimeSlots(GetAppointmentTimeSlots(), timeSlotsContainer);
    applyInitialSelection();
  } else {
    clearCalendar();
  }

  selectActiveCards();
}

function normalizeState() {
  if (AppointmentState.doctor && !findDoctorById(AppointmentState.doctor)) {
    AppointmentState.doctor = null;
  }

  if (AppointmentState.service && !findServiceById(AppointmentState.service)) {
    AppointmentState.service = null;
  }
}

function resolveDefaults(preferredSource) {
  if (preferredSource === 'service' && AppointmentState.service) {
    const doctorsForService = getDoctorsForService(AppointmentState.service);
    if (AppointmentState.doctor && !isDoctorInList(AppointmentState.doctor, doctorsForService)) {
      AppointmentState.doctor = null;
    }

    AppointmentState.date = null;
    AppointmentState.time = null;
    return;
  }

  if (preferredSource === 'doctor' && AppointmentState.doctor) {
    const servicesForDoctor = getServicesForDoctor(AppointmentState.doctor);
    if (AppointmentState.service && !isServiceInList(AppointmentState.service, servicesForDoctor)) {
      AppointmentState.service = null;
    }

    AppointmentState.date = null;
    AppointmentState.time = null;
    return;
  }

  if (AppointmentState.doctor) {
    const servicesForDoctor = getServicesForDoctor(AppointmentState.doctor);
    if (AppointmentState.service && !isServiceInList(AppointmentState.service, servicesForDoctor)) {
      AppointmentState.service = null;
    }
  }

  if (AppointmentState.service) {
    const doctorsForService = getDoctorsForService(AppointmentState.service);
    if (AppointmentState.doctor && !isDoctorInList(AppointmentState.doctor, doctorsForService)) {
      AppointmentState.doctor = null;
    }
  }
}

function renderFilteredContainers() {
  const doctors = AppointmentState.service ? getDoctorsForService(AppointmentState.service) : GetDoctors();
  const services = AppointmentState.doctor ? getServicesForDoctor(AppointmentState.doctor) : GetServices();

  renderAppointmentDoctors(doctors, doctorsContainer);
  renderAppointmentServices(services, servicesContainer);
}

function applyInitialSelection() {
  const selectedDay = GetAppointmentCalendar().find(day => day.status === 'selected') || GetAppointmentCalendar().find(day => day.status === 'available');
  if (selectedDay) {
    AppointmentState.date = selectedDay.date;
    selectDay({ date: selectedDay.date }, calendarDaysContainer);
  } else {
    AppointmentState.date = null;
    AppointmentState.time = null;
  }

  applySlotSelection();
}

function applySlotSelection() {
  const selectedSlot = GetAppointmentTimeSlots().find(slot => slot.status === 'selected') || GetAppointmentTimeSlots().find(slot => slot.status === 'available');
  if (selectedSlot) {
    AppointmentState.time = selectedSlot.time;
    selectTimeSlot({ time: selectedSlot.time }, timeSlotsContainer);
  } else {
    AppointmentState.time = null;
  }
}

function clearCalendar() {
  if (calendarDaysContainer) {
    calendarDaysContainer.innerHTML = '';
  }

  if (timeSlotsContainer) {
    timeSlotsContainer.innerHTML = '';
  }

  AppointmentState.date = null;
  AppointmentState.time = null;
}

function selectActiveCards() {
  if (AppointmentState.doctor) {
    selectCard(AppointmentState.doctor, doctorsContainer);
  }

  if (AppointmentState.service) {
    selectCard(AppointmentState.service, servicesContainer);
  }
}

function getServicesForDoctor(doctorId) {
  const doctor = findDoctorById(doctorId);
  if (!doctor) return GetServices();

  return GetServices().filter(service => doctor.services.includes(service.title));
}

function getDoctorsForService(serviceId) {
  const service = findServiceById(serviceId);
  if (!service) return GetDoctors();

  return GetDoctors().filter(doctor => doctor.services.includes(service.title));
}

function findDoctorById(doctorId) {
  return GetDoctors().find(doctor => String(doctor.id) === String(doctorId));
}

function findServiceById(serviceId) {
  return GetServices().find(service => String(service.id) === String(serviceId));
}

function isDoctorInList(doctorId, doctors) {
  return doctors.some(doctor => String(doctor.id) === String(doctorId));
}

function isServiceInList(serviceId, services) {
  return services.some(service => String(service.id) === String(serviceId));
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
