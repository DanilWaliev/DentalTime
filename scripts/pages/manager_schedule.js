import { GetAppointments } from './../data/data.js';
import { renderSchedule } from './../components/cards.js';


renderSchedule(GetAppointments(), document.getElementById('schedule-grid'));
