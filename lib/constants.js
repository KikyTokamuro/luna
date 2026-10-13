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
