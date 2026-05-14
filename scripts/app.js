import * as UI from './ui.js';
import * as data from './data.js';

function initApp() {
  UI.renderDoctors(data.GetDoctors())
}

document.addEventListener('DOMContentLoaded', initApp)