// Скрипты для странциы врачей в роли менеджера

import { GetDoctors } from './../data/data.js';
import { renderManagerDoctors} from './../components/cards.js';

renderManagerDoctors(GetDoctors(), document.getElementById('manager-doctors-container'));