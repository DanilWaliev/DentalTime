// Скрипты для странциы записей в роли менеджера

import { GetAppointments} from './../data/data.js';
import { renderAppointments} from './../components/cards.js';

renderAppointments(GetAppointments(), document.getElementById('appointments-container'));