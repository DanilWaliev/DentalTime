const apiBase = '/api';

let doctors = [];
let services = [];
let appointments = [];
let managers = [];
let appointmentCalendar = [];
let appointmentTimeSlots = [];
let loadPromise = null;

export async function loadAppData() {
  if (!loadPromise) {
    loadPromise = loadCoreData();
  }

  return loadPromise;
}

export async function reloadAppData() {
  loadPromise = null;
  return loadAppData();
}

async function loadCoreData() {
  try {
    const [doctorResponse, serviceResponse, appointmentResponse] = await Promise.all([
      apiRequest('GET', `${apiBase}/doctors`),
      apiRequest('GET', `${apiBase}/services`),
      apiRequest('GET', `${apiBase}/appointments`),
    ]);

    services = mapServices(serviceResponse.services || []);
    appointments = mapAppointments(appointmentResponse.appointments || []);
    doctors = await mapDoctors(doctorResponse.doctors || []);
  } catch (error) {
    loadPromise = null;
    throw error;
  }
}

export function GetDoctors() {
  return doctors;
}

export function GetServices() {
  return services;
}

export function GetAppointments() {
  return appointments;
}

export function GetManagers() {
  return managers;
}

export function GetAppointmentByNumber(appointmentNumber) {
  return appointments.find(appointment => String(appointment.num) === String(appointmentNumber));
}

export function GetAppointmentCalendar() {
  return appointmentCalendar;
}

export function GetAppointmentTimeSlots() {
  return appointmentTimeSlots;
}

export function AddDoctor(doctor) {
  doctors.push(doctor);
}

export function AddService(service) {
  services.push(service);
}

export function AddAppointment(appointment) {
  appointments.push(appointment);
}

export async function loadDoctorAvailability(doctorId, dateValue = null) {
  if (!doctorId) {
    appointmentCalendar = [];
    appointmentTimeSlots = [];
    return;
  }

  const dayValue = normalizeDatePart(dateValue || formatCurrentDatePart());
  const monthValue = dayValue.slice(0, 7);

  const [calendarResponse, slotsResponse] = await Promise.all([
    apiRequest('GET', `${apiBase}/doctors/${doctorId}/calendar?month=${monthValue}`),
    apiRequest('GET', `${apiBase}/doctors/${doctorId}/slots?date=${dayValue}`),
  ]);

  appointmentCalendar = mapCalendarDays(calendarResponse.days || []);
  appointmentTimeSlots = mapTimeSlots(slotsResponse.slots || []);
}

export async function loadDoctorSlots(doctorId, dateValue) {
  if (!doctorId || !dateValue) {
    appointmentTimeSlots = [];
    return;
  }

  const dayValue = normalizeDatePart(dateValue);
  const slotsResponse = await apiRequest('GET', `${apiBase}/doctors/${doctorId}/slots?date=${dayValue}`);
  appointmentTimeSlots = mapTimeSlots(slotsResponse.slots || []);
}

export async function ApiCreateAppointment(appointment) {
  const payload = buildAppointmentPayload(appointment);
  const created = await apiRequest('POST', `${apiBase}/appointments`, payload);
  await reloadAppData();

  return mapAppointment(created);
}

export async function ApiAddManagerAppointment(appointment) {
  return ApiCreateAppointment(appointment);
}

export async function ApiUpdateAppointment(appointmentId, updatedData) {
  const current = GetAppointments().find(item => String(item.id) === String(appointmentId));
  const merged = Object.assign({}, current || {}, updatedData);
  const payload = buildAppointmentPayload(merged, current);
  const updated = await apiRequest('PUT', `${apiBase}/appointments/${appointmentId}`, payload);
  await reloadAppData();

  return mapAppointment(updated);
}

export async function ApiDeleteAppointment(appointmentId) {
  await apiRequest('DELETE', `${apiBase}/appointments/${appointmentId}`);
  await reloadAppData();
}

export async function CancelAppointment(appointmentId) {
  const updated = await apiRequest('POST', `${apiBase}/appointments/${appointmentId}/cancel`);
  await reloadAppData();

  return mapAppointment(updated);
}

export async function RescheduleAppointment(appointmentId, newDate) {
  const updated = await apiRequest('POST', `${apiBase}/appointments/${appointmentId}/reschedule`, {
    date: newDate,
  });
  await reloadAppData();

  return mapAppointment(updated);
}

export async function ApiAddDoctor(doctor) {
  const created = await apiRequest('POST', `${apiBase}/doctors`, buildDoctorPayload(doctor));
  const doctorId = created.doctor_id || created.id;

  if (doctor.photoFile) {
    await ApiUploadDoctorPhoto(doctorId, doctor.photoFile);
  }

  await syncDoctorServices(doctorId, doctor.services || []);
  await reloadAppData();

  return created;
}

export async function ApiUpdateDoctor(doctorId, updatedData) {
  await apiRequest('PUT', `${apiBase}/doctors/${doctorId}`, buildDoctorPayload(updatedData));

  if (updatedData.photoFile) {
    await ApiUploadDoctorPhoto(doctorId, updatedData.photoFile);
  }

  await syncDoctorServices(doctorId, updatedData.services || []);
  await reloadAppData();
}

export async function ApiDeleteDoctor(doctorId) {
  await apiRequest('DELETE', `${apiBase}/doctors/${doctorId}`);
  await reloadAppData();
}

export async function ApiAddService(service) {
  const created = await apiRequest('POST', `${apiBase}/services`, buildServicePayload(service));
  await reloadAppData();

  return created;
}

export async function ApiUpdateService(serviceId, updatedData) {
  await apiRequest('PUT', `${apiBase}/services/${serviceId}`, buildServicePayload(updatedData));
  await reloadAppData();
}

export async function ApiDeleteService(serviceId) {
  await apiRequest('DELETE', `${apiBase}/services/${serviceId}`);
  await reloadAppData();
}

export async function loadManagers() {
  const response = await apiRequest('GET', `${apiBase}/managers`);
  managers = mapManagers(response.managers || []);
  return managers;
}

export async function ApiAddManager(manager) {
  const created = await apiRequest('POST', `${apiBase}/managers`, {
    login: manager.login || '',
    password: manager.password || '',
  });
  await loadManagers();

  return created;
}

export async function ApiDeleteManager(managerId) {
  await apiRequest('DELETE', `${apiBase}/managers/${managerId}`);
  await loadManagers();
}

export async function ApiLogin(credentials) {
  return apiRequest('POST', `${apiBase}/login`, {
    login: credentials.login || credentials.username || '',
    password: credentials.password || '',
  });
}

export async function ApiUploadDoctorPhoto(doctorId, file) {
  const formData = new FormData();
  formData.append('photo', file);

  return apiRequest('POST', `${apiBase}/doctors/${doctorId}/photo`, formData);
}

async function syncDoctorServices(doctorId, serviceTitles) {
  const desiredIds = serviceTitles
    .map(title => findServiceByTitle(title))
    .filter(Boolean)
    .map(service => service.id);

  const currentDoctor = GetDoctors().find(doctor => String(doctor.id) === String(doctorId));
  const currentIds = currentDoctor ? currentDoctor.services.map(title => {
    const service = findServiceByTitle(title);
    return service ? service.id : null;
  }).filter(Boolean) : [];

  for (const serviceId of currentIds) {
    if (!desiredIds.includes(serviceId)) {
      await apiRequest('DELETE', `${apiBase}/doctors/${doctorId}/services/${serviceId}`);
    }
  }

  for (const serviceId of desiredIds) {
    if (!currentIds.includes(serviceId)) {
      await apiRequest('POST', `${apiBase}/doctors/${doctorId}/services`, {
        service_id: serviceId,
      });
    }
  }
}

function buildDoctorPayload(doctor) {
  return {
    full_name: doctor.fullName || doctor.full_name || '',
    specialization: doctor.spec || doctor.specialization || '',
    experience: Number(doctor.experience || 0),
    photo_url: doctor.photo?.url || doctor.photo_url || doctor.photoUrl || '',
  };
}

function buildServicePayload(service) {
  return {
    title: service.title || '',
    subtitle: service.subtitle || '',
    duration: Number(service.duration || 0),
    price: Number(service.price || 0),
  };
}

function buildAppointmentPayload(appointment, current = null) {
  const service = resolveService(appointment.service, current ? current.service : null);
  const doctor = resolveDoctor(appointment.doctor, current ? current.doctor : null);
  const date = resolveAppointmentDate(appointment, current);

  return {
    status: appointment.status || (current ? current.status : 'Ожидает'),
    patient_first_name: appointment.patientName || appointment.patientFirstName || appointment.patient_first_name || (current ? current.patientName : ''),
    patient_phone_number: normalizePhone(appointment.patientPhoneNumber || appointment.patientNumber || appointment.patient_phone_number || (current ? current.patientPhoneNumber : '')),
    date,
    service_id: service ? service.id : 0,
    doctor_id: doctor ? doctor.id : 0,
  };
}

function resolveService(value, fallback = null) {
  if (value && typeof value === 'object') {
    if (value.id) {
      return { id: Number(value.id), title: value.title || '' };
    }

    if (value.title) {
      return findServiceByTitle(value.title);
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    if (/^\d+$/.test(value.trim())) {
      const service = services.find(item => String(item.id) === String(value.trim()));
      if (service) return service;
    }

    const service = findServiceByTitle(value.trim());
    if (service) return service;
  }

  return fallback && fallback.id ? fallback : null;
}

function resolveDoctor(value, fallback = null) {
  if (value && typeof value === 'object') {
    if (value.id) {
      return { id: Number(value.id), fullName: value.fullName || '' };
    }

    if (value.fullName) {
      return findDoctorByFullName(value.fullName);
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    if (/^\d+$/.test(value.trim())) {
      const doctor = doctors.find(item => String(item.id) === String(value.trim()));
      if (doctor) return doctor;
    }

    const doctor = findDoctorByFullName(value.trim());
    if (doctor) return doctor;
  }

  return fallback && fallback.id ? fallback : null;
}

function resolveAppointmentDate(appointment, current = null) {
  if (appointment.date && String(appointment.date).includes('T')) {
    return String(appointment.date);
  }

  if (appointment.date && appointment.time) {
    return combineDateAndTime(String(appointment.date), String(appointment.time));
  }

  if (appointment.date && !appointment.time) {
    return String(appointment.date);
  }

  if (current && current.date) {
    return String(current.date);
  }

  return '';
}

function combineDateAndTime(dateValue, timeValue) {
  const date = normalizeDatePart(dateValue);
  const time = normalizeTimePart(timeValue);
  const localDate = new Date(`${date}T${time}:00`);
  const offsetMinutes = -localDate.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, '0');
  const offsetMinutesPart = String(absoluteOffset % 60).padStart(2, '0');

  return `${date}T${time}:00${sign}${offsetHours}:${offsetMinutesPart}`;
}

function normalizeDatePart(value) {
  if (!value) return '';

  const raw = String(value).trim();
  if (raw.includes('T')) {
    return raw.slice(0, 10);
  }

  return raw.slice(0, 10);
}

function normalizeTimePart(value) {
  if (!value) return '';

  const raw = String(value).trim();
  return raw.slice(0, 5);
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatCurrentDatePart() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function findServiceByTitle(title) {
  return services.find(service => service.title === title) || null;
}

function findDoctorByFullName(fullName) {
  return doctors.find(doctor => doctor.fullName === fullName) || null;
}

function mapServices(items) {
  return items.map(item => ({
    id: item.service_id,
    title: item.title,
    subtitle: item.subtitle,
    duration: item.duration,
    price: item.price,
  }));
}

function mapDoctors(items) {
  return Promise.all(items.map(async item => {
    const doctor = {
      id: item.doctor_id,
      fullName: item.full_name,
      spec: item.specialization,
      experience: item.experience,
      photo: item.photo_url ? { url: item.photo_url } : null,
      services: [],
      nearest: [],
    };

    const response = await apiRequest('GET', `${apiBase}/doctors/${doctor.id}/services`);
    doctor.services = (response.services || []).map(service => service.title);
    doctor.nearest = buildNearest(doctor.id);

    return doctor;
  }));
}

function mapAppointments(items) {
  return items.map(mapAppointment);
}

function mapManagers(items) {
  return items.map(item => ({
    id: item.manager_id,
    login: item.login,
  }));
}

function mapAppointment(item) {
  return {
    id: item.id,
    num: item.num,
    status: item.status,
    patientName: item.patientName,
    patientPhoneNumber: item.patientPhoneNumber,
    service: {
      id: item.service.id,
      title: item.service.title,
    },
    doctor: {
      id: item.doctor.id,
      fullName: item.doctor.fullName,
    },
    date: item.date,
    duration: item.duration,
  };
}

function buildNearest(doctorId) {
  const now = new Date();

  return appointments
    .filter(appointment => String(appointment.doctor.id) === String(doctorId))
    .filter(appointment => appointment.status !== 'Отменена')
    .filter(appointment => new Date(appointment.date) >= now)
    .sort((left, right) => new Date(left.date) - new Date(right.date))
    .slice(0, 2)
    .map(appointment => formatNearestDate(appointment.date));
}

function formatNearestDate(dateValue) {
  const date = new Date(dateValue);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((target - today) / 86400000);
  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diff === 0) {
    return `Сегодня ${time}`;
  }

  if (diff === 1) {
    return `Завтра ${time}`;
  }

  return `${date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })} ${time}`;
}

function mapCalendarDays(days) {
  return days.map(day => ({
    date: day.date,
    text: day.text,
    status: day.status,
  }));
}

function mapTimeSlots(slots) {
  return slots.map(slot => ({
    time: slot.time,
    status: slot.status,
  }));
}

async function apiRequest(method, url, body = null) {
  const options = {
    method,
    headers: {},
    credentials: 'include',
  };

  if (body !== null) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}
