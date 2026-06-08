import { initBurgerMenu } from '../core.js';
import { GetServices, loadAppData } from './../data/data.js';
import { renderServices } from './../components/cards.js';

async function init() {
  initBurgerMenu();
  await loadAppData();
  renderServices(GetServices(), document.getElementById('services-container'));
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
