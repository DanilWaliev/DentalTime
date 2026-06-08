import { initBurgerMenu } from '../core.js';
import { GetDoctors, loadAppData } from './../data/data.js';
import { renderDoctors } from './../components/cards.js';

async function init() {
  initBurgerMenu();
  await loadAppData();
  renderDoctors(GetDoctors(), document.getElementById('doctors-container'));
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});
