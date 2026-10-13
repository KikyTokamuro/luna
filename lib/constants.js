/** 
 * Название приложения.
 * @type {string} 
 */
export const APP_NAME = 'Луна - календарь цикла';

/**
 * Версия приложения. Подставляется сборкой.
 * @type {string} 
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION;

/** 
 * Сайт автора. 
 * @type {string} 
 */
export const AUTHOR_URL = 'https://kikytokamuro.space/about/';

/** 
 * Список симптомов для дневника (чипы в календаре). 
 * @type {string[]} 
 */
export const SYMPTOMS = [
    'Спазмы',
    'Головная боль',
    'Усталость',
    'Болезненность груди',
    'Перепады настроения',
    'Тошнота',
    'Выделения',
    'Бессонница'
];

/** 
 * Человекочитаемые названия фаз (см. cycle.js#phaseName).
 * @type {{
 *   period: string,
 *   periodPredicted: string,
 *   ovulation: string,
 *   fertile: string,
 *   follicular: string,
 *   luteal: string,
 *   transitional: string
 * }}
 */
export const PHASES = {
    period: 'Менструация',
    periodPredicted: 'Ожидается менструация',
    ovulation: 'Овуляция',
    fertile: 'Фертильное окно',
    follicular: 'Фолликулярная фаза',
    luteal: 'Лютеиновая фаза',
    transitional: 'Переходная фаза'
};

/**
 * Дефолтные параметры цикла, пока нет истории.
 * @type {{
 *   cycle: number,   // Длительность цикла в днях
 *   period: number   // Длительность менструации в днях
 * }}
 */
export const DEFAULT_SETTINGS = {
    cycle: 28,
    period: 5
};
