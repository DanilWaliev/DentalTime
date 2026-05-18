// Скрипты для странциы услуг

import { GetServices } from './../data/data.js';
import { renderServices } from './../components/cards.js';

renderServices(GetServices(), document.getElementById('services-container'));