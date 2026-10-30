/** 
 * Application name.
 * @type {string} 
 */
export const APP_NAME = 'Луна - календарь цикла';

/**
 * Application version, injected at build time.
 * @type {string} 
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION;

/** 
 * Author website. 
 * @type {string} 
 */
export const AUTHOR_URL = 'https://kikytokamuro.space/about/';

/** 
 * Symptoms available in the diary (calendar chips). 
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
 * Human-readable phase names (see cycle.js#phaseName).
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
 * Default cycle settings until history is available.
 * @type {{
 *   cycle: number,   // Cycle length in days
 *   period: number   // Period length in days
 * }}
 */
export const DEFAULT_SETTINGS = {
    cycle: 28,
    period: 5
};
