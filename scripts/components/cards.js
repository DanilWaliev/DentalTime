export function bindAction(container, actionName, onActionCallback) {
  if (!container) return;

  container.addEventListener('click', (event) => {
    const targetElement = event.target.closest(`[data-action=${actionName}]`);

    if (!targetElement) return;

    event.preventDefault();

    const itemId = targetElement.dataset.id;
    if (itemId) onActionCallback(itemId);
  });
}

export function renderDoctors(doctors, doctorsContainer) {
  if (!doctorsContainer) return;

  doctorsContainer.innerHTML = '';

  doctors.forEach(doctor => {
    const cardElement = document.createElement('div');
    cardElement.className = "card doctor-card";
    cardElement.innerHTML = generateDoctorCard(doctor);

    doctorsContainer.appendChild(cardElement);
  });
}

function generateDoctorCard(doctor) {
  return `   <div class="doctor-card-top">
                 <div class="doctor-photo">Фото</div>
                 <div class="doctor-info-basic">
                     <div class="doctor-name">${doctor.fullName}</div>
                     <div class="doctor-specialty">${doctor.spec}</div>
                     <div class="doctor-badges">
                         <span class="badge badge-outline">Стаж: ${doctor.experience} лет</span>
                     </div>
                 </div>
             </div>
             <div class="doctor-services">
                   <div class="pills-container">
                     ${doctor.services.map(service => `<span class="badge badge-primary">${service}</span>`).join('')}
                   </div>
                   <div class="schedule-container">
                   <span class="schedule-title">Ближайшая запись:</span>
                   ${doctor.nearest.map(slot => `<span class="badge badge-secondary">${slot}</span>`).join('')}
                   </div>
               </div>
               <div class="doctor-actions">
                 <a href="appointment.html?doctorId=${doctor.id}#step-3" class="btn btn-secondary btn-sm btn-full" data-action="select" data-id="${doctor.id}">Записаться к врачу</a>
               </div>  
           </div>`;
}

export function renderServices(services, servicesContainer) {
  if (!servicesContainer) return;

  servicesContainer.innerHTML = '';

  services.forEach(service => {
    const cardElement = document.createElement('div');
    cardElement.className = "card services-card";
    cardElement.innerHTML = generateServiceCard(service);

    servicesContainer.appendChild(cardElement);
  });
}

function generateServiceCard(service) {
  return `
    <div class="service-card-content">
        <div class="services-card-title">${service.title}</div>
        <div class="services-card-description">${service.subtitle}</div>
    </div>
    <div class="service-card-footer">
        <div class="service-details">
            <span class="service-duration">${service.duration} мин</span>
            <span class="service-price">${service.price.toLocaleString('ru-RU')} ₽</span>
        </div>
        <a href="appointment.html?serviceId=${service.id}#step-2" class="btn btn-primary btn-sm btn-full" data-action="select" data-id="${service.id}">Записаться</a>
    </div>
  `;
}

export function renderAppointments(appointments, appointmentsContainer) {
  if (!appointmentsContainer) return;

  appointmentsContainer.innerHTML = '';

  appointments.forEach(appointment => {
    const cardElement = document.createElement('div');
    cardElement.className = "card record-card";
    cardElement.innerHTML = generateAppointmentCard(appointment);

    appointmentsContainer.appendChild(cardElement);
  });
}

function generateAppointmentCard(appointment) {
  const statusClass = appointment.status === 'Подтверждена' ? 'badge-primary' : 'badge-outline';
  
  return `
    <div class="record-header">
        <span class="record-id">Запись №${appointment.num}</span>
        <span class="badge ${statusClass}">${appointment.status}</span>
    </div>
    
    <div class="record-body">
        <div class="record-row">
            <span class="record-label">Пациент</span>
            <span class="record-value">${appointment.patientName}</span>
        </div>
        <div class="record-row">
            <span class="record-label">Услуга</span>
            <span class="record-value">${appointment.service.title}</span>
        </div>
        <div class="record-row">
            <span class="record-label">Врач</span>
            <span class="record-value">${appointment.doctor.fullName}</span>
        </div>
        <div class="record-row">
            <span class="record-label">Дата и время</span>
            <span class="record-value">${formatDate(appointment.date)}</span>
        </div>
    </div>
    
    <div class="record-actions">
        <button class="btn btn-primary btn-sm" data-action="edit" data-id="${appointment.id}">Изменить</button>
        ${appointment.status === 'Ожидает' ? `<button class="btn btn-primary btn-sm" data-action="confirm" data-id="${appointment.id}">Подтвердить</button>` : ''}
        <button class="btn btn-outline btn-sm text-danger" data-action="delete" data-id="${appointment.id}">Удалить</button>
    </div>
  `;
}

export function renderManagerDoctors(doctors, doctorsContainer) {
  if (!doctorsContainer) return;

  doctorsContainer.innerHTML = '';

  doctors.forEach(doctor => {
    const cardElement = document.createElement('div');
    cardElement.className = "card doctor-edit-card";
    cardElement.innerHTML = generateManagerDoctorCard(doctor);

    doctorsContainer.appendChild(cardElement);
  });
}

function generateManagerDoctorCardOld(doctor) {
  return `
    <div class="doctor-edit-top">
        <button class="photo-upload">
            <span>Заменить</span>
        </button>
        
        <div class="doctor-inputs">
            <div class="form-group">
                <label class="form-label">ФИО</label>
                <input type="text" class="form-input" value="${doctor.fullName}">
            </div>
            <div class="form-group">
                <label class="form-label">Специальность</label>
                <input type="text" class="form-input" value="${doctor.spec}">
            </div>
            <div class="form-group">
                <label class="form-label">Стаж работы</label>
                <input type="text" class="form-input" value="${doctor.experience} лет">
            </div>
        </div>
    </div>
    
    <div class="doctor-inputs-bottom">
        <div class="form-group">
            <label class="form-label">Оказываемые услуги (через запятую)</label>
            <input type="text" class="form-input" value="${doctor.services.join(', ')}">
        </div>
    </div>
    
    <div class="doctor-actions">
        <button class="btn btn-primary btn-sm" data-action="edit" data-id="${doctor.id}">Изменить</button>
        <button class="btn btn-outline btn-sm text-danger" data-action="delete" data-id="${doctor.id}">Удалить</button>
    </div>
  `;
}

function generateManagerDoctorCard(doctor) {
  const photoContent = doctor.photo?.url
    ? `<img class="doctor-photo-image" src="${doctor.photo.url}" alt="${doctor.fullName}">`
    : 'Фото';

  return `
    <div class="doctor-edit-top">
        <div class="photo-upload doctor-photo-view">
            ${photoContent}
        </div>

        <div class="doctor-inputs">
            <div class="doctor-name">${doctor.fullName}</div>
            <div class="doctor-specialty">${doctor.spec}</div>
            <div class="doctor-badges">
                <span class="badge badge-outline">Стаж: ${doctor.experience} лет</span>
            </div>
        </div>
    </div>

    <div class="doctor-services">
        <div class="pills-container">
            ${doctor.services.map(service => `<span class="badge badge-primary">${service}</span>`).join('')}
        </div>
    </div>

    <div class="doctor-actions">
        <button class="btn btn-primary btn-sm" data-action="edit" data-id="${doctor.id}">Изменить</button>
        <button class="btn btn-outline btn-sm text-danger" data-action="delete" data-id="${doctor.id}">Удалить</button>
    </div>
  `;
}

export function renderManagerServices(services, servicesContainer) {
  if (!servicesContainer) return;

  servicesContainer.innerHTML = '';

  services.forEach(service => {
    const cardElement = document.createElement('div');
    cardElement.className = "card service-edit-card";
    cardElement.innerHTML = generateManagerServiceCard(service);

    servicesContainer.appendChild(cardElement);
  });
}

function generateManagerServiceCard(service) {
  return `
    <div class="form-group">
        <label class="form-label">Название услуги</label>
        <input type="text" class="form-input" value="${service.title}">
    </div>
    
    <div class="form-group">
        <label class="form-label">Описание</label>
        <textarea class="form-input" rows="3">${service.subtitle}</textarea>
    </div>
    
    <div class="service-inputs-row">
        <div class="form-group">
            <label class="form-label">Длительность</label>
            <input type="text" class="form-input" value="${service.duration} мин">
        </div>
        <div class="form-group">
            <label class="form-label">Стоимость</label>
            <input type="text" class="form-input" value="${service.price.toLocaleString('ru-RU')} ₽">
        </div>
    </div>
    
    <div class="service-actions">
        <button class="btn btn-primary btn-sm" data-action="save" data-id="${service.id}">Сохранить</button>
        <button class="btn btn-outline btn-sm text-danger" data-action="delete" data-id="${service.id}">Удалить</button>
    </div>
  `;
}

function generateAppointmentServicesCard(service) {
  return `
      <div class="service-card-content">
          <div class="services-card-title">${service.title}</div>
          <div class="services-card-description">${service.subtitle}</div>
      </div>
      <div class="service-card-footer">
          <div class="service-details">
              <span class="service-duration">${service.duration} мин</span>
              <span class="service-price">${service.price.toLocaleString('ru-RU')} ₽</span>
          </div>
          <button class="btn btn-secondary btn-sm btn-full" data-action="select" data-id="${service.id}">Выбрать</button>
      </div>
    `;
}

export function renderAppointmentServices(services, container) {
  if (!container) return;
  container.innerHTML = '';
  services.forEach(service => {
    const cardElement = document.createElement('div');
    cardElement.className = "card slider-card services-card";
    cardElement.setAttribute('data-id', service.id);
    cardElement.innerHTML = generateAppointmentServicesCard(service);
    container.appendChild(cardElement);
  });
}

function generateAppointmentDoctorsCard(doctor) {
  return `
      <div class="doctor-card-top">
          <div class="doctor-photo">Фото</div>
          <div class="doctor-info-basic">
              <div class="doctor-name">${doctor.fullName}</div>
              <div class="doctor-specialty">${doctor.spec}</div>
              <div class="doctor-badges">
                  <span class="badge badge-outline">Стаж: ${doctor.experience} лет</span>
              </div>
          </div>
      </div>
      <div class="doctor-services">
          <div class="pills-container">
              ${doctor.services.map(service => `<span class="badge badge-primary">${service}</span>`).join('')}
          </div>
          <div class="schedule-container">
              <span class="schedule-title">Ближайшая запись:</span>
              ${doctor.nearest.map(slot => `<span class="badge badge-secondary">${slot}</span>`).join('')}
          </div>
      </div>
      <div class="doctor-actions">
        <a href="#step-3" class="btn btn-secondary btn-sm btn-full" data-action="select" data-id="${doctor.id}">Выбрать врача</a>
      </div>
    `;
}

export function renderAppointmentDoctors(doctors, container) {
  if (!container) return;
  container.innerHTML = '';
  doctors.forEach(doctor => {
    const cardElement = document.createElement('div');
    cardElement.className = "card slider-card doctor-card";
    cardElement.setAttribute('data-id', doctor.id);
    cardElement.innerHTML = generateAppointmentDoctorsCard(doctor);
    container.appendChild(cardElement);
  });
}

export function selectCard(id, container) {
  if (!container) return;
  
  const prevSelected = container.querySelector('.card.active');
  if (prevSelected) {
    prevSelected.classList.remove('active');
  }

  const newSelected = container.querySelector(`.card[data-id="${id}"]`);
  if (newSelected) {
    newSelected.classList.add('active');
  }
}

export function renderAppointmentStatus(appointment, container) {
  if (!container) return;

  const statusClass = appointment.status === 'Подтверждена' ? 'badge-primary' : 'badge-outline';
  const isCanceled = appointment.status === 'Отменена';
  const actions = isCanceled
    ? ''
    : `
    <div class="status-actions">
        <button class="btn btn-secondary btn-md" data-action="reschedule" data-id="${appointment.id}">Перенести</button>
        <button class="btn btn-outline btn-md" data-action="cancel" data-id="${appointment.id}">Отменить</button>
    </div>
  `;
  
  container.innerHTML = `
    <div class="status-header">
        <span class="status-id">Запись №${appointment.num}</span>
        <span class="badge ${statusClass}">${appointment.status}</span>
    </div>
    
    <div class="status-body">
        <div class="status-row">
            <span class="status-label">Услуга</span>
            <span class="status-value">${appointment.service.title}</span>
        </div>
        <div class="status-row">
            <span class="status-label">Врач</span>
            <span class="status-value">${appointment.doctor.fullName}</span>
        </div>
        <div class="status-row">
            <span class="status-label">Дата и время</span>
            <span class="status-value">${formatDate(appointment.date)}</span>
        </div>
        <div class="status-row">
            <span class="status-label">Длительность</span>
            <span class="status-value">${appointment.duration} мин</span>
        </div>
    </div>

    ${actions}
  `;
}

function generateSchedule(app) {
  const date = new Date(app.date);
  const endTime = new Date(date.getTime() + app.duration * 60000);
  const timeRange = `${formatTime(date)} - ${formatTime(endTime)}`;
  return `
        <div class="event-header">
            <div class="event-time-wrapper">
                <span class="event-time">${timeRange}</span>
                <span class="event-id text-muted">№${app.num}</span>
            </div>
            <div class="event-actions">
                <button class="event-action-btn" data-action="edit" data-id="${app.id}">Изменить</button>
                <button class="event-action-btn text-danger" data-action="delete" data-id="${app.id}">Удалить</button>
            </div>
        </div>
        <div class="event-doctor">${app.doctor.fullName}</div>
        <div class="event-service">${app.service.title}</div>
    `;
}

export function renderSchedule(appointments, container) {
  if (!container) return;

  // Очистка существующих событий, но оставляем метки времени и линии сетки
  const existingEvents = container.querySelectorAll('.schedule-event');
  existingEvents.forEach(el => el.remove());

  appointments.forEach(app => {
    const date = new Date(app.date);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Сетка начинается с 10:00 (первая строка), каждая строчка по 15 минут (4 строчки в час)
    const rowStart = (hours - 10) * 4 + (minutes / 15) + 1;
    const rowSpan = app.duration / 15;
    // Сопоставление ID доктора к ID столбца
    const column = app.doctor.id + 1;

    const eventElement = document.createElement('div');
    eventElement.className = "card schedule-event";
    eventElement.style.gridRow = `${rowStart} / span ${rowSpan}`;
    eventElement.style.gridColumn = column;

    eventElement.innerHTML = generateSchedule(app);
    
    container.appendChild(eventElement);
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' };
  return date.toLocaleDateString('ru-RU', options);
}
