// Общий для всех страниц скрипт

export function initBurgerMenu() {
    const burgerBtn = document.querySelector('.burger-menu-btn');
    const navMenu = document.querySelector('.desktop-menu');

    // Проверка существования элементов на странице
    if (!burgerBtn || !navMenu) return;

    // Открытие/закрытие по клику на бургер
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('is-active');
        navMenu.classList.toggle('is-open');
    });

    // Закрытие меню при клике на любую ссылку внутри него
    navMenu.addEventListener('click', (event) => {
        if (event.target.classList.contains('top-menu-button')) {
            burgerBtn.classList.remove('is-active');
            navMenu.classList.remove('is-open');
        }
    });
}