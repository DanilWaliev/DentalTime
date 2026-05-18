// Скрипты для странциы просмотра статуса записи

import { GetAppointments } from './../data/data.js';
import { renderAppointmentStatus } from './../components/cards.js';

renderAppointmentStatus(GetAppointments()[0], document.getElementById('status-card'));