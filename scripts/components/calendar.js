export function renderAppointmentCalendar(days, container) {
  if (days.length !== 35) return;
  
  if (!container) return;

  container.innerHTML = '';

  days.forEach(day => {
    let calendarButton = document.createElement('button');
    calendarButton.classList.toggle('calendar-day');
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