
/** 
 * @param {number} n 
 * @returns {string} '5' -> '05' 
 */
const pad = n => String(n).padStart(2, '0');

/** 
 * Date -> key 'YYYY-MM-DD'. 
 * @param {Date} d 
 * @returns {string} 
 */
export const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 
 * Key 'YYYY-MM-DD' -> date. 
 * @param {string} k 
 * @returns {Date} 
 */
export const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

/** 
 * New date = d + n days (independent copy). 
 * @param {Date} d 
 * @param {number} n 
 * @returns {Date} 
 */
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** 
 * Difference in calendar days: a - b. 
 * @param {Date} a 
 * @param {Date} b 
 * @returns {number} 
 */
export const diffDays = (a, b) => Math.round((a - b) / 86400000);

/** 
 * Month names, indexed by getMonth(). 
 * @type {string[]} 
 */
export const MONTHS = [
  'Январь', 'Февраль', 'Март',
  'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь',
  'Октябрь', 'Ноябрь', 'Декабрь'
];

/** 
 * Abbreviated weekdays, starting with Monday. 
 * @type {string[]} 
 */
export const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** 
 * Format date in Russian -> '13 октября'. 
 * @param {Date} d 
 * @returns {string} 
 */
export const fmtLong = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

/** 
 * Format date in Russian -> '13 окт. 2026 г.'. 
 * @param {Date} d 
 * @returns {string} 
 */
export const fmtShort = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Calendar month grid: null placeholders before the first Monday,
 * followed by a Date for each day of the month.
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
