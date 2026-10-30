import { addDays, diffDays, fromKey } from './dates.js';
import { PHASES } from './constants.js';

/**
 * Groups a sorted set of dates into continuous intervals.
 * Days no more than one day apart are treated as a single run (accounts for crossing midnight).
 * @param {Set<string>} set date keys
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
 * Reconstructs each cycle from history: boundaries, ovulation, and the fertile window.
 * For completed cycles, use the actual next start (ovulation =
 * actual start - 14; the luteal phase is the most stable part of the cycle);
 * for the current cycle, predict it using the average length.
 * @param {{start: string, end: string}[]} runs
 * @param {number} avgCycle average cycle length
 */
function cyclesFrom(runs, avgCycle) {
  const cycles = [];

  for (let i = 0; i < runs.length; i++) {
    const start = fromKey(runs[i].start);
    const actualNext = runs[i + 1] ? fromKey(runs[i + 1].start) : null;
    const nextStart = actualNext || addDays(start, avgCycle);
    const cycleLen = Math.max(1, diffDays(nextStart, start));

    // Ovulation is 14 days before the next start; clamp it to reasonable bounds
    // in case the recorded data contains an unusually short cycle.
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
 * Cycle context from history: runs, cycle/period lengths, per-cycle
 * reconstruction (cycles), averages over the last six cycles (or defaults from
 * settings when history is limited). Average cycle length is the median of the last six
 * (resistant to outliers); with one or two cycles, use the arithmetic mean.
 * @param {Set<string>} periodSet period days
 * @param {{
 *   cycle: number, 
 *   period: number
 * }} settings defaults
 */
export function buildCtx(periodSet, settings) {
  const runs = runsFrom(periodSet);
  const cycleLens = [], periodLens = [];

  // Cycle i length = time from the start of run (i-1) to the start of run i.
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
 * Predict the next cycle from the last recorded period start.
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
 * Status of a single day for calendar highlighting.
 * Assign the day to the cycle it falls in (the most recently started one),
 * so ovulation and fertile days are shown for past cycles too.
 * predicted is only for predicted periods in the current cycle;
 * cycleDay is the cycle day counted from its start.
 * @param {string} key date
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
 * Phase name for a day: recorded events (period, ovulation) take precedence
 * over calculated phases. Follicular is before the fertile window; luteal is
 * after it; the intervening phase is transitional.
 * @param {ReturnType<typeof statusOf>} st
 * @param {ReturnType<typeof buildCtx>} ctx
 * @returns {string} value from PHASES
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
