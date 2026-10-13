
/** 
 * @param {number} n 
 * @returns {string} '5' -> '05' 
 */
const pad = n => String(n).padStart(2, '0');

/** 
 * Дата -> ключ 'YYYY-MM-DD'. 
 * @param {Date} d 
 * @returns {string} 
 */
export const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 
 * Ключ 'YYYY-MM-DD' -> дата. 
 * @param {string} k 
 * @returns {Date} 
 */
export const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

/** 
 * Новая дата = d + n дней (независимая копия). 
 * @param {Date} d 
 * @param {number} n 
 * @returns {Date} 
 */
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** 
 * Разница в календарных днях a - b. 
 * @param {Date} a 
 * @param {Date} b 
 * @returns {number} 
 */
export const diffDays = (a, b) => Math.round((a - b) / 86400000);

/** 
 * Названия месяцев, индекс = getMonth(). 
 * @type {string[]} 
 */
export const MONTHS = [
  'Январь', 'Февраль', 'Март',
  'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь',
  'Октябрь', 'Ноябрь', 'Декабрь'
];

/** 
 * Сокращенные дни недели, понедельник первым. 
 * @type {string[]} 
 */
export const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** 
 * Конвертация даты в РУ формат -> '13 октября'. 
 * @param {Date} d 
 * @returns {string} 
 */
export const fmtLong = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

/** 
 * Конвертация даты в РУ формат -> '13 окт. 2026 г.'. 
 * @param {Date} d 
 * @returns {string} 
 */
export const fmtShort = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Сетка дней месяца для календаря: null-заглушки до первого понедельника,
 * затем Date каждого дня месяца.
 * @param {number} year
 * @param {number} month 0-11
 * @returns {(Date|null)[]}
 */
export function monthGrid(year, month) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(year, month, d));

  return cells;
}
