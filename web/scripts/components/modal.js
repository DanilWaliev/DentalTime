export function showInfo(title, message, onClose = null) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-info';

    dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">${title}</h3>
            <p class="modal-body">${message}</p>
            <div class="modal-footer">
                <button class="btn btn-primary btn-sm" data-action="close">Понятно</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const closeModal = () => {
        dialog.close();
        dialog.remove();
        if (onClose && typeof onClose === 'function') onClose();
    };

    dialog.querySelector('[data-action="close"]').addEventListener('click', closeModal);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeModal(); });
}

export function showConfirm(title, message, onConfirm, onCancel = null) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-confirm';

    dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">${title}</h3>
            <p class="modal-body">${message}</p>
            <div class="modal-footer">
                <button class="btn btn-outline btn-sm" data-action="cancel">Отмена</button>
                <button class="btn btn-primary btn-sm" data-action="confirm">Да, продолжить</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const closeModal = (callback) => {
        dialog.close();
        dialog.remove();
        if (callback && typeof callback === 'function') callback();
    };

    dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => closeModal(onCancel));
    dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        if (onConfirm) onConfirm();
        closeModal();
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeModal(onCancel); });
}

export function showLoading(message) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-loading';

    dialog.innerHTML = `
        <div class="modal-inner" style="align-items: center; text-align: center;">
            <div class="spinner"></div>
            <p class="modal-body">${message}</p>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    return {
        close: () => {
            dialog.close();
            dialog.remove();
        }
    };
}

export function GetPhoneAndName(title, onConfirm, onCancel = null) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-form';

    dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">${title}</h3>
            <div class="modal-body">
                <div class="form-group" style="margin-bottom: var(--space-sm);">
                    <label class="form-label">Ваше имя</label>
                    <input type="text" class="form-input" id="modal-name" placeholder="Иван Иванов">
                </div>
                <div class="form-group">
                    <label class="form-label">Номер телефона</label>
                    <input type="tel" class="form-input" id="modal-phone" placeholder="+7 (999) 000-00-00">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline btn-sm" data-action="cancel">Отмена</button>
                <button class="btn btn-primary btn-sm" data-action="submit">Подтвердить запись</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const closeModal = (callback) => {
        dialog.close();
        dialog.remove();
        if (callback && typeof callback === 'function') callback();
    };

    dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => closeModal(onCancel));
    dialog.querySelector('[data-action="submit"]').addEventListener('click', () => {
        const nameInput = dialog.querySelector('#modal-name');
        const phoneInput = dialog.querySelector('#modal-phone');
        
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        nameInput.style.borderColor = '';
        phoneInput.style.borderColor = '';

        let hasError = false;

        if (!name) {
            nameInput.style.borderColor = 'var(--color-error, #ff4d4d)';
            hasError = true;
        }
        
        const digitsOnly = phone.replace(/\D/g, ''); 
        if (digitsOnly.length < 11) {
            phoneInput.style.borderColor = 'var(--color-error, #ff4d4d)';
            hasError = true;
        }

        if (hasError) return;
        
        if (onConfirm) onConfirm({ name, phone });
        closeModal();
    });
    
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeModal(onCancel); });
}

export function showAddAppointmentModal(title, onConfirm, appointment = null, doctors = [], services = [], onCancel = null, showStatus = false) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-form';

    const appointmentData = appointment || {
        patientName: '',
        patientPhoneNumber: '',
        service: null,
        doctor: null,
        date: '',
        status: 'Ожидает'
    };
    let selectedService = findServiceForModal(services, appointmentData.service);
    let selectedDoctor = findDoctorForModal(doctors, appointmentData.doctor);

    dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">${title}</h3>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">ФИО Пациента</label>
                    <input type="text" class="form-input" id="new-patient-name" value="${appointmentData.patientName || ''}" placeholder="Иванов Иван">
                </div>
                <div class="form-group">
                    <label class="form-label">Номер телефона</label>
                    <input type="tel" class="form-input" id="new-patient-phone" value="${appointmentData.patientPhoneNumber || ''}" placeholder="+7 (999) 000-00-00">
                </div>
                <div class="form-group">
                    <label class="form-label">Услуга</label>
                    <div class="doctor-service-selected" id="appointment-service-selected"></div>
                    <div class="doctor-service-list" id="appointment-service-list"></div>
                </div>
                <div class="form-group">
                    <label class="form-label">Врач</label>
                    <div class="doctor-service-selected" id="appointment-doctor-selected"></div>
                    <div class="doctor-service-list" id="appointment-doctor-list"></div>
                </div>
                <div class="form-group">
                    <label class="form-label">Дата и время</label>
                    <input type="datetime-local" class="form-input" id="new-appointment-date" value="${formatDateTimeForModal(appointmentData.date)}">
                </div>
                ${showStatus ? `
                <div class="form-group">
                    <label class="form-label" for="edit-appointment-status">Статус</label>
                    <select class="form-input" id="edit-appointment-status">
                        <option value="Ожидает">Ожидает</option>
                        <option value="Подтверждена">Подтверждена</option>
                        <option value="Отменена">Отменена</option>
                    </select>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline btn-sm" data-action="cancel">Отмена</button>
                <button class="btn btn-primary btn-sm" data-action="submit">${appointment ? 'Сохранить' : 'Создать запись'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const selectedServiceElement = dialog.querySelector('#appointment-service-selected');
    const servicesListElement = dialog.querySelector('#appointment-service-list');
    const selectedDoctorElement = dialog.querySelector('#appointment-doctor-selected');
    const doctorsListElement = dialog.querySelector('#appointment-doctor-list');
    const statusSelect = dialog.querySelector('#edit-appointment-status');

    if (statusSelect) {
        statusSelect.value = appointmentData.status || 'Ожидает';
    }

    const renderChoices = () => {
        const availableServices = getServicesForModal(services, selectedDoctor);
        const availableDoctors = getDoctorsForModal(doctors, selectedService);

        selectedServiceElement.innerHTML = selectedService ? `
            <button type="button" class="badge badge-primary doctor-service-badge" data-action="clear-appointment-service">${selectedService.title} ×</button>
        ` : '';

        servicesListElement.innerHTML = availableServices.map(service => {
            const disabled = selectedService && String(selectedService.id) === String(service.id) ? 'disabled' : '';
            return `<button type="button" class="btn btn-outline btn-sm doctor-service-option" data-action="select-appointment-service" data-id="${service.id}" ${disabled}>${service.title}</button>`;
        }).join('');

        selectedDoctorElement.innerHTML = selectedDoctor ? `
            <button type="button" class="badge badge-primary doctor-service-badge" data-action="clear-appointment-doctor">${selectedDoctor.fullName} ×</button>
        ` : '';

        doctorsListElement.innerHTML = availableDoctors.map(doctor => {
            const disabled = selectedDoctor && String(selectedDoctor.id) === String(doctor.id) ? 'disabled' : '';
            return `<button type="button" class="btn btn-outline btn-sm doctor-service-option" data-action="select-appointment-doctor" data-id="${doctor.id}" ${disabled}>${doctor.fullName}</button>`;
        }).join('');
    };

    renderChoices();

    const closeModal = (callback) => {
        dialog.close();
        dialog.remove();
        if (callback && typeof callback === 'function') callback();
    };

    dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => closeModal(onCancel));
    dialog.addEventListener('click', (event) => {
        const serviceButton = event.target.closest('[data-action="select-appointment-service"]');
        const doctorButton = event.target.closest('[data-action="select-appointment-doctor"]');
        const clearServiceButton = event.target.closest('[data-action="clear-appointment-service"]');
        const clearDoctorButton = event.target.closest('[data-action="clear-appointment-doctor"]');

        if (serviceButton) {
            selectedService = services.find(service => String(service.id) === String(serviceButton.dataset.id)) || null;
            if (selectedDoctor && selectedService && !doctorHasServiceForModal(selectedDoctor, selectedService)) {
                selectedDoctor = null;
            }
            renderChoices();
        }

        if (doctorButton) {
            selectedDoctor = doctors.find(doctor => String(doctor.id) === String(doctorButton.dataset.id)) || null;
            if (selectedDoctor && selectedService && !doctorHasServiceForModal(selectedDoctor, selectedService)) {
                selectedService = null;
            }
            renderChoices();
        }

        if (clearServiceButton) {
            selectedService = null;
            renderChoices();
        }

        if (clearDoctorButton) {
            selectedDoctor = null;
            renderChoices();
        }
    });
    dialog.querySelector('[data-action="submit"]').addEventListener('click', () => {
        const patientName = dialog.querySelector('#new-patient-name');
        const patientPhone = dialog.querySelector('#new-patient-phone');
        const appointmentDate = dialog.querySelector('#new-appointment-date');

        const fields = [patientName, patientPhone, appointmentDate];
        let hasError = false;

        fields.forEach(field => {
            field.style.borderColor = '';
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--color-error, #ff4d4d)';
                hasError = true;
            }
        });

        const patientPhoneDigits = patientPhone.value.replace(/\D/g, '');
        if (patientPhoneDigits.length < 11) {
            patientPhone.style.borderColor = 'var(--color-error, #ff4d4d)';
            hasError = true;
        }

        selectedServiceElement.style.borderColor = '';
        selectedDoctorElement.style.borderColor = '';

        if (!selectedService) {
            selectedServiceElement.style.borderColor = 'var(--color-error, #ff4d4d)';
            hasError = true;
        }

        if (!selectedDoctor) {
            selectedDoctorElement.style.borderColor = 'var(--color-error, #ff4d4d)';
            hasError = true;
        }

        if (hasError) return;
        
        if (onConfirm) {
            onConfirm({
                patientName: patientName.value.trim(),
                patientNumber: patientPhone.value.trim(),
                service: selectedService,
                doctor: selectedDoctor,
                date: appointmentDate.value,
                status: statusSelect ? statusSelect.value : appointmentData.status
            });
        }
        closeModal();
    });
    
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeModal(onCancel); });
}

function findServiceForModal(services, service) {
    if (!service) return null;

    if (service.id) {
        return services.find(item => String(item.id) === String(service.id)) || service;
    }

    if (service.title) {
        return services.find(item => item.title === service.title) || service;
    }

    return null;
}

function findDoctorForModal(doctors, doctor) {
    if (!doctor) return null;

    if (doctor.id) {
        return doctors.find(item => String(item.id) === String(doctor.id)) || doctor;
    }

    if (doctor.fullName) {
        return doctors.find(item => item.fullName === doctor.fullName) || doctor;
    }

    return null;
}

function getServicesForModal(services, doctor) {
    if (!doctor) return services;

    return services.filter(service => doctorHasServiceForModal(doctor, service));
}

function getDoctorsForModal(doctors, service) {
    if (!service) return doctors;

    return doctors.filter(doctor => doctorHasServiceForModal(doctor, service));
}

function doctorHasServiceForModal(doctor, service) {
    if (!doctor || !service) return false;

    return (doctor.services || []).includes(service.title);
}

function formatDateTimeForModal(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return String(dateString).slice(0, 16);
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

export function showDoctorModal(title, onConfirm, doctor = null, services = [], onCancel = null) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-form';

    const doctorData = doctor || {
        fullName: '',
        spec: '',
        experience: '',
        services: [],
        nearest: [],
        photo: null
    };
    const photoPreview = doctorData.photo?.url || '';
    let selectedPhotoFile = null;
    let selectedPhotoPreviewUrl = doctorData.photo?.url || null;
    let selectedServices = [...doctorData.services];

    dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">${title}</h3>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Фото</label>
                    <div class="doctor-photo-upload">
                        <div class="doctor-photo-preview" id="doctor-photo-preview" ${photoPreview ? `style="background-image: url('${photoPreview}')"` : ''}>
                            ${photoPreview ? '' : 'Фото'}
                        </div>
                        <label class="btn btn-outline btn-sm" for="doctor-photo">Выбрать фото</label>
                        <input type="file" id="doctor-photo" accept="image/*" hidden>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">ФИО</label>
                    <input type="text" class="form-input" id="doctor-full-name" value="${doctorData.fullName}" placeholder="Иван Иванов">
                </div>
                <div class="form-group">
                    <label class="form-label">Специальность</label>
                    <input type="text" class="form-input" id="doctor-spec" value="${doctorData.spec}" placeholder="Стоматолог-терапевт">
                </div>
                <div class="form-group">
                    <label class="form-label">Стаж</label>
                    <input type="number" class="form-input" id="doctor-experience" value="${doctorData.experience}" min="0" placeholder="5">
                </div>
                <div class="form-group">
                    <label class="form-label">Оказываемые услуги</label>
                    <div class="doctor-service-selected" id="doctor-service-selected"></div>
                    <div class="doctor-service-list" id="doctor-service-list"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline btn-sm" data-action="cancel">Отмена</button>
                <button class="btn btn-primary btn-sm" data-action="submit">Сохранить</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const photoInput = dialog.querySelector('#doctor-photo');
    const photoPreviewElement = dialog.querySelector('#doctor-photo-preview');
    const selectedServicesElement = dialog.querySelector('#doctor-service-selected');
    const servicesListElement = dialog.querySelector('#doctor-service-list');

    const renderServices = () => {
        selectedServicesElement.innerHTML = selectedServices.map(service => `
            <button type="button" class="badge badge-primary doctor-service-badge" data-action="remove-service" data-service="${service}">${service} ×</button>
        `).join('');

        servicesListElement.innerHTML = services.map(service => {
            const disabled = selectedServices.includes(service.title) ? 'disabled' : '';
            return `<button type="button" class="btn btn-outline btn-sm doctor-service-option" data-action="add-service" data-service="${service.title}" ${disabled}>${service.title}</button>`;
        }).join('');
    };

    renderServices();

    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            selectedPhotoFile = file;
            selectedPhotoPreviewUrl = reader.result;
            photoPreviewElement.textContent = '';
            photoPreviewElement.style.backgroundImage = `url('${selectedPhotoPreviewUrl}')`;
        });
        reader.readAsDataURL(file);
    });

    const closeModal = (callback) => {
        dialog.close();
        dialog.remove();
        if (callback && typeof callback === 'function') callback();
    };

    dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => closeModal(onCancel));
    dialog.addEventListener('click', (event) => {
        const addButton = event.target.closest('[data-action="add-service"]');
        const removeButton = event.target.closest('[data-action="remove-service"]');

        if (addButton) {
            const serviceTitle = addButton.dataset.service;
            if (serviceTitle && !selectedServices.includes(serviceTitle)) {
                selectedServices.push(serviceTitle);
                renderServices();
            }
        }

        if (removeButton) {
            const serviceTitle = removeButton.dataset.service;
            selectedServices = selectedServices.filter(service => service !== serviceTitle);
            renderServices();
        }
    });
    dialog.querySelector('[data-action="submit"]').addEventListener('click', () => {
        const fullNameInput = dialog.querySelector('#doctor-full-name');
        const specInput = dialog.querySelector('#doctor-spec');
        const experienceInput = dialog.querySelector('#doctor-experience');
        const fields = [fullNameInput, specInput, experienceInput];
        let hasError = false;

        fields.forEach(field => {
            field.style.borderColor = '';
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--color-error, #ff4d4d)';
                hasError = true;
            }
        });

        selectedServicesElement.style.borderColor = '';
        if (selectedServices.length === 0) {
            selectedServicesElement.style.borderColor = 'var(--color-error, #ff4d4d)';
            hasError = true;
        }

        if (hasError) return;

        if (onConfirm) {
            onConfirm({
                fullName: fullNameInput.value.trim(),
                spec: specInput.value.trim(),
                experience: Number(experienceInput.value),
                services: selectedServices,
                nearest: doctorData.nearest || [],
                photo: doctorData.photo || null,
                photoFile: selectedPhotoFile,
                photoPreviewUrl: selectedPhotoPreviewUrl
            });
        }

        closeModal();
    });

    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeModal(onCancel); });
}

export function showServiceModal(title, onConfirm, service = null, onCancel = null) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-form';

    const serviceData = service || {
        title: '',
        subtitle: '',
        duration: '',
        price: ''
    };

    dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">${title}</h3>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Название услуги</label>
                    <input type="text" class="form-input" id="service-title" value="${serviceData.title}" placeholder="Лечение кариеса">
                </div>
                <div class="form-group">
                    <label class="form-label">Описание</label>
                    <textarea class="form-input" id="service-subtitle" rows="3" placeholder="Краткое описание услуги">${serviceData.subtitle}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Длительность, мин</label>
                    <input type="number" class="form-input" id="service-duration" value="${serviceData.duration}" min="1" placeholder="60">
                </div>
                <div class="form-group">
                    <label class="form-label">Стоимость, ₽</label>
                    <input type="number" class="form-input" id="service-price" value="${serviceData.price}" min="0" placeholder="5500">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline btn-sm" data-action="cancel">Отмена</button>
                <button class="btn btn-primary btn-sm" data-action="submit">Сохранить</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    const closeModal = (callback) => {
        dialog.close();
        dialog.remove();
        if (callback && typeof callback === 'function') callback();
    };

    dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => closeModal(onCancel));
    dialog.querySelector('[data-action="submit"]').addEventListener('click', () => {
        const titleInput = dialog.querySelector('#service-title');
        const subtitleInput = dialog.querySelector('#service-subtitle');
        const durationInput = dialog.querySelector('#service-duration');
        const priceInput = dialog.querySelector('#service-price');
        const fields = [titleInput, subtitleInput, durationInput, priceInput];
        let hasError = false;

        fields.forEach(field => {
            field.style.borderColor = '';
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--color-error, #ff4d4d)';
                hasError = true;
            }
        });

        if (hasError) return;

        if (onConfirm) {
            onConfirm({
                title: titleInput.value.trim(),
                subtitle: subtitleInput.value.trim(),
                duration: Number(durationInput.value),
                price: Number(priceInput.value)
            });
        }

        closeModal();
    });

    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeModal(onCancel); });
}
