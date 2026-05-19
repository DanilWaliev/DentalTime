export function renderAppointmentCalendar(days, container) {
  if (days.length !== 35) return;
  
  if (!container) return;

  container.innerHTML = '';

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