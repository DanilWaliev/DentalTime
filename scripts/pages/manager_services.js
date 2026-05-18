// Скрипты для странциы сервисов в роли менеджера

import { GetServices } from './../data/data.js';
import { renderManagerServices } from './../components/cards.js';

renderManagerServices(GetServices(), document.getElementById('manager-services-container'));