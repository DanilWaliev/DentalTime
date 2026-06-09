export function renderAppointmentCalendar(days, container) {
  if (days.length !== 35) return;
  
  if (!container) return;

  container.innerHTML = '';
  updateCalendarMonth(container, days);

  days.forEach(day => {
    let calendarButton = document.createElement('button');
    calendarButton.classList.toggle('calendar-day');
    calendarButton.setAttribute('data-id', day.date);
    calendarButton.setAttribute('data-action', 'select');
    switch (day.status) {
      case 'disabled':
        calendarButton.classList.toggle('disabled');
        break;
      case 'selected':
        calendarButton.classList.toggle('active');
        break;
    }

    calendarButton.textContent = day.text;

    container.appendChild(calendarButton);
  });
}

export function selectDay(day, container) {
  if (!container) return;

  const prevSelected = container.querySelector('.calendar-day.active');
  if (prevSelected) {
    prevSelected.classList.remove('active');
  }

  // Используем data-id, так как именно этот атрибут устанавливается в renderAppointmentCalendar
  const newSelected = container.querySelector(`[data-id="${day.date}"]`);
  if (newSelected && !newSelected.classList.contains('disabled')) {
    newSelected.classList.add('active');
  }
}

export function renderAppointmentTimeSlots(slots, container) {
  if (!container) return;

  container.innerHTML = '';

  slots.forEach(slot => {
    let slotButton = document.createElement('button');
    slotButton.classList.add('time-slot');
    slotButton.setAttribute('data-id', slot.time);
    slotButton.setAttribute('data-action', 'select-time');
    
    switch (slot.status) {
      case 'disabled':
        slotButton.classList.add('disabled');
        break;
      case 'selected':
        slotButton.classList.add('active');
        break;
    }

    slotButton.textContent = slot.time;
    container.appendChild(slotButton);
  });
}

export function selectTimeSlot(slotData, container) {
  if (!container) return;

  const prevSelected = container.querySelector('.time-slot.active');
  if (prevSelected) {
    prevSelected.classList.remove('active');
  }

  const newSelected = container.querySelector(`[data-id="${slotData.time}"]`);
  if (newSelected && !newSelected.classList.contains('disabled')) {
    newSelected.classList.add('active');
  }
}

function updateCalendarMonth(container, days) {
  const monthElement = container.closest('.calendar-widget')?.querySelector('.calendar-month');
  if (!monthElement || days.length === 0) return;

  const currentDay = days.find(day => day.status === 'selected') || days.find(day => day.status === 'available') || days[0];
  const firstDay = new Date(currentDay.date);
  if (Number.isNaN(firstDay.getTime())) return;

  monthElement.textContent = firstDay.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
}
