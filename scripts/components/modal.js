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
