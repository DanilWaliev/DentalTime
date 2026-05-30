export function initSlider(container) {
    if (!container) return;

    const section = container.closest('section');
    if (!section) return;

    const btnNext = section.querySelector('[data-action="next"]');
    const btnPrev = section.querySelector('[data-action="prev"]');

    if (!btnNext || !btnPrev) return;

    // Функция обновления состояния кнопок (скрытие на краях)
    const updateButtons = () => {
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        // Даем небольшую погрешность в 2px для надежности
        btnPrev.style.opacity = scrollLeft <= 2 ? '0.3' : '1';
        btnPrev.style.pointerEvents = scrollLeft <= 2 ? 'none' : 'auto';

        btnNext.style.opacity = scrollLeft >= maxScroll - 2 ? '0.3' : '1';
        btnNext.style.pointerEvents = scrollLeft >= maxScroll - 2 ? 'none' : 'auto';
    };

    // Скролл вправо
    btnNext.addEventListener('click', () => {
        container.scrollBy({
            left: container.clientWidth * 0.8, // Листаем на 80% ширины для наглядности
            behavior: 'smooth'
        });
    });

    // Скролл влево
    btnPrev.addEventListener('click', () => {
        container.scrollBy({
            left: -container.clientWidth * 0.8,
            behavior: 'smooth'
        });
    });

    // Следим за скроллом для обновления кнопок
    container.addEventListener('scroll', updateButtons);
    
    // Инициализируем начальное состояние
    updateButtons();

    // Обновляем при изменении размера окна
    window.addEventListener('resize', updateButtons);
}
