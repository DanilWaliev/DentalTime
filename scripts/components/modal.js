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

        // Сбрасываем предыдущие ошибки
        nameInput.style.borderColor = '';
        phoneInput.style.borderColor = '';

        let hasError = false;

        if (!name) {
            nameInput.style.borderColor = 'var(--color-error, #ff4d4d)';
            hasError = true;
        }
        
        // Проверка: номер должен содержать минимум 11 цифр
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

export function showAddAppointmentModal(title, onConfirm, onCancel = null) {
    const dialog = document.createElement('dialog');
    dialog.className = 'app-modal modal-form';

    dialog.innerHTML = `
        <div class="modal-inner">
            <h3 class="modal-title">${title}</h3>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">ФИО Пациента</label>
                    <input type="text" class="form-input" id="new-patient-name" placeholder="Иванов Иван">
                </div>
                <div class="form-group">
                    <label class="form-label">Услуга</label>
                    <input type="text" class="form-input" id="new-service-title" placeholder="Лечение кариеса">
                </div>
                <div class="form-group">
                    <label class="form-label">Врач</label>
                    <input type="text" class="form-input" id="new-doctor-name" placeholder="Смирнова А. В.">
                </div>
                <div class="form-group">
                    <label class="form-label">Дата и время</label>
                    <input type="datetime-local" class="form-input" id="new-appointment-date">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline btn-sm" data-action="cancel">Отмена</button>
                <button class="btn btn-primary btn-sm" data-action="submit">Создать запись</button>
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
        const patientName = dialog.querySelector('#new-patient-name');
        const serviceTitle = dialog.querySelector('#new-service-title');
        const doctorName = dialog.querySelector('#new-doctor-name');
        const appointmentDate = dialog.querySelector('#new-appointment-date');

        const fields = [patientName, serviceTitle, doctorName, appointmentDate];
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
                patientName: patientName.value,
                service: { title: serviceTitle.value },
                doctor: { fullName: doctorName.value },
                date: appointmentDate.value
            });
        }
        closeModal();
    });
    
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeModal(onCancel); });
}

function splitList(value) {
    return value.split(',').map(item => item.trim()).filter(Boolean);
}

export function showDoctorModal(title, onConfirm, doctor = null, onCancel = null) {
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
                    <label class="form-label">Оказываемые услуги (через запятую)</label>
                    <input type="text" class="form-input" id="doctor-services" value="${doctorData.services.join(', ')}" placeholder="Лечение кариеса, Чистка">
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
    dialog.querySelector('[data-action="submit"]').addEventListener('click', () => {
        const fullNameInput = dialog.querySelector('#doctor-full-name');
        const specInput = dialog.querySelector('#doctor-spec');
        const experienceInput = dialog.querySelector('#doctor-experience');
        const servicesInput = dialog.querySelector('#doctor-services');
        const fields = [fullNameInput, specInput, experienceInput, servicesInput];
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
                fullName: fullNameInput.value.trim(),
                spec: specInput.value.trim(),
                experience: Number(experienceInput.value),
                services: splitList(servicesInput.value),
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
