// Скрипты для странциы врачей

import { GetDoctors } from './../data/data.js';
import { renderDoctors } from './../components/cards.js';

renderDoctors(GetDoctors(), document.getElementById('doctors-container'));