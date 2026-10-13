import { addDays, diffDays, fromKey } from './dates.js';
import { PHASES } from './constants.js';

/**
 * Схлопывает отсортированный набор дат в непрерывные интервалы.
 * Дни с разницей <= 1 счетаются одним запуском (учитывает "переход через полночь").
 * @param {Set<string>} set ключи дат
 * @returns {{
 *   start: string, 
 *   end: string
 * }[]}
 */
export function runsFrom(set) {
  const runs = [];

  for (const k of [...set].sort()) {
    const last = runs[runs.length - 1];
    if (last && diffDays(fromKey(k), fromKey(last.end)) <= 1) last.end = k;
    else runs.push({ start: k, end: k });
  }

  return runs;
}

/**
 * Реконструирует каждый цикл из истории: границы, овуляцию и фертильное окно.
 * Для завершенных циклов следующее начало берется фактическое (овуляция =
 * факт. начало - 14, лютеиновая фаза самая стабильная часть цикла);
 * для текущего - прогноз по средней длине.
 * @param {{start: string, end: string}[]} runs
 * @param {number} avgCycle средняя длина цикла
 */
function cyclesFrom(runs, avgCycle) {
  const cycles = [];

  for (let i = 0; i < runs.length; i++) {
    const start = fromKey(runs[i].start);
    const actualNext = runs[i + 1] ? fromKey(runs[i + 1].start) : null;
    const nextStart = actualNext || addDays(start, avgCycle);
    const cycleLen = Math.max(1, diffDays(nextStart, start));

    // Овуляция за 14 дней до следующего начала; клампим в разумные границы
    // на случай аномально коротких циклов в отметках.
    const ovulation = addDays(nextStart, -14);
    const minOv = addDays(start, 5), maxOv = addDays(nextStart, -1);
    const ov = ovulation < minOv ? minOv : ovulation > maxOv ? maxOv : ovulation;

    cycles.push({
      start,
      startKey: runs[i].start,
      nextStart,
      cycleLen,
      periodLen: diffDays(fromKey(runs[i].end), fromKey(runs[i].start)) + 1,
      ovulation: ov,
      ovDay: diffDays(ov, start) + 1,
      fertileStart: addDays(ov, -5),
      fertileEnd: addDays(ov, 1),
      projected: !actualNext
    });
  }

  return cycles;
}

/**
 * Контекст цикла из истории: запуски, длины циклов/месячных, покомпонентная
 * реконструкция (cycles), средние по последним 6 циклам (или дефолты из
 * settings, если истории мало). Средняя длина цикла - медиана последних 6
 * (устойчива к единичным сбоям), у 1-2 циклов - обычное среднее.
 * @param {Set<string>} periodSet дни месячных
 * @param {{
 *   cycle: number, 
 *   period: number
 * }} settings дефолты
 */
export function buildCtx(periodSet, settings) {
  const runs = runsFrom(periodSet);
  const cycleLens = [], periodLens = [];

  // Длина i-го цикла = от начала (i-1)-го запуска до начала i-го.
  for (let i = 0; i < runs.length; i++) {
    periodLens.push(diffDays(fromKey(runs[i].end), fromKey(runs[i].start)) + 1);
    if (i > 0) cycleLens.push(diffDays(fromKey(runs[i].start), fromKey(runs[i - 1].start)));
  }

  const avgOf = a => a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0;
  const medOf = a => {
    const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  };
  const c6 = cycleLens.slice(-6), p6 = periodLens.slice(-6);
  const avgCycle = !c6.length ? settings.cycle : c6.length >= 3 ? medOf(c6) : avgOf(c6);

  return {
    runs, cycleLens, periodLens,
    cycles: cyclesFrom(runs, avgCycle),
    avgCycle,
    avgPeriod: p6.length ? avgOf(p6) : settings.period
  };
}

/**
 * Прогноз следующего цикла от последнего зафиксированного начала месячных.
 * @returns {null|{
 *   nextStart: Date, 
 *   periodEnd: Date, 
 *   ovulation: Date, 
 *   fertileStart: Date, 
 *   fertileEnd: Date
 * }}
 */
export function predict(ctx) {
  const last = ctx.cycles[ctx.cycles.length - 1];
  if (!last) return null;

  return {
    nextStart: last.nextStart,
    periodEnd: addDays(last.nextStart, ctx.avgPeriod - 1),
    ovulation: last.ovulation,
    fertileStart: last.fertileStart,
    fertileEnd: last.fertileEnd
  };
}

/**
 * Статус одного дня для подсветки в календаре.
 * День привязывается к циклу, в который он попадает (последнему начавшемуся),
 * поэтому овуляция/фертильные дни показываются и за прошлые периоды.
 * predicted - только для прогнозируемых месячных текущего цикла;
 * cycleDay - день цикла от начала своего цикла.
 * @param {string} key дата
 * @param {Set<string>} periodSet
 * @param {ReturnType<typeof buildCtx>} ctx
 */
export function statusOf(key, periodSet, ctx) {
  const d = fromKey(key);
  const s = { cycleDay: null, period: periodSet.has(key), predicted: false, ovulation: false, fertile: false, ovDay: null };

  if (!ctx.cycles.length) return s;

  let cur = null;
  for (const c of ctx.cycles) {
    if (d >= c.start) cur = c; else break;
  }
  if (!cur) return s;

  s.cycleDay = diffDays(d, cur.start) + 1;
  s.ovDay = cur.ovDay;
  s.ovulation = diffDays(d, cur.ovulation) === 0;
  s.fertile = d >= cur.fertileStart && d <= cur.fertileEnd;

  if (cur.projected && !s.period && d >= cur.nextStart && d <= addDays(cur.nextStart, ctx.avgPeriod - 1)) {
    s.predicted = true;
  }

  return s;
}

/**
 * Название фазы для дня: приоритет фактическим событиям (месячные, овуляция)
 * над расчетными фазами. Фолликулярная - до фертильного окна, лютеиновая -
 * после него, между ними переходная.
 * @param {ReturnType<typeof statusOf>} st
 * @param {ReturnType<typeof buildCtx>} ctx
 * @returns {string} значение из PHASES
 */
export function phaseName(st, ctx) {
  if (st.period) return PHASES.period;
  if (st.predicted) return PHASES.periodPredicted;
  if (st.ovulation) return PHASES.ovulation;
  if (st.fertile) return PHASES.fertile;

  if (st.cycleDay != null) {
    if (st.ovDay) {
      if (st.cycleDay < st.ovDay - 5) return PHASES.follicular;
      if (st.cycleDay > st.ovDay + 1) return PHASES.luteal;
    } else if (ctx.avgCycle) {
      if (st.cycleDay <= ctx.avgCycle - 17) return PHASES.follicular;
      if (st.cycleDay >= ctx.avgCycle - 12) return PHASES.luteal;
    }
  }

  return PHASES.transitional;
}
