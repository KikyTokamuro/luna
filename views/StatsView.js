import { html } from '../lib/html.js';
import { useState } from 'https://esm.sh/preact@11.0.1/hooks';
import { toKey, fromKey, diffDays, fmtLong, fmtShort, MONTHS } from '../lib/dates.js';
import Card from '../components/Card.js';

/**
 * Склонение слова "цикл" по количеству.
 * @param {number} n
 * @returns {string}
 */
const cycleWord = n => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return 'цикл';
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'цикла';
  return 'циклов';
};

/**
 * Склонение слова "раз" по количеству.
 * @param {number} n
 * @returns {string}
 */
const timesWord = n => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return 'раз';
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'раза';
  return 'раз';
};

/**
 * Вкладка "Статистика".
 * @param {{
 *   today: Date,
 *   ctx: object,
 *   pred: object|null,
 *   logs: Record<string, object>
 * }} props
 */
export default function StatsView({ today, ctx, pred, logs }) {
  const curCycleDay = ctx.runs.length ? diffDays(today, fromKey(ctx.runs[ctx.runs.length - 1].start)) + 1 : null;
  const daysToNext = pred ? diffDays(pred.nextStart, today) : null;

  // Отметки полового акта: всего, за текущий месяц, последняя дата, средний интервал.
  const monthPrefix = toKey(new Date(today.getFullYear(), today.getMonth(), 1)).slice(0, 7);
  const sexKeys = Object.values(logs)
    .filter(l => l && l.sex && l.date <= toKey(today))
    .map(l => l.date)
    .sort();
  const sexTotal = sexKeys.length;
  const sexMonth = sexKeys.filter(k => k.startsWith(monthPrefix)).length;
  const lastSex = sexKeys.length ? fromKey(sexKeys[sexKeys.length - 1]) : null;
  let sexAvgGap = null;

  if (sexKeys.length > 1) {
    let sum = 0;
    for (let i = 1; i < sexKeys.length; i++) sum += diffDays(fromKey(sexKeys[i]), fromKey(sexKeys[i - 1]));
    sexAvgGap = Math.round(sum / (sexKeys.length - 1));
  }

  const yearList = ctx.cycles.map(c => c.start.getFullYear());
  const minY = yearList.length ? Math.min(...yearList) : null;
  const maxY = yearList.length ? Math.max(...yearList) : null;
  const [selYear, setSelYear] = useState(maxY);
  const y = minY == null ? null : Math.min(Math.max(selYear, minY), maxY);
  const items = y == null ? [] : ctx.cycles.filter(c => !c.projected && c.start.getFullYear() === y);

  return html`
    <div class="grid grid-cols-2 gap-3">
      <${Card} title="Текущий день цикла" value=${curCycleDay != null ? curCycleDay : '-'}
        sub=${curCycleDay != null ? (pred && daysToNext >= 0 ? 'до следующих: ' + daysToNext + ' дн.' : 'цикл еще не отмечен') : 'отметьте менструацию'} />
      <${Card} title="Средний цикл" value=${ctx.avgCycle + ' дн.'} accent="text-rose-600"
        sub=${'по последним ' + Math.min(ctx.cycleLens.length, 6) + ' циклам'} />
      <${Card} title="Длительность менструации" value=${ctx.avgPeriod + ' дн.'} />
      <${Card} title=${daysToNext != null && daysToNext < 0 ? 'Задержка' : 'Следующая менструация'}
        value=${pred ? fmtLong(pred.nextStart) : '-'}
        accent=${daysToNext != null && daysToNext < 0 ? 'text-amber-600' : 'text-slate-800'} />
      <${Card} title="Половые акты" value=${sexTotal} accent="text-rose-600"
        sub="отметок за все время" />
      <${Card} title="Половые акты за месяц" value=${sexMonth}
        sub=${MONTHS[today.getMonth()] + ' ' + today.getFullYear()} />
    </div>

    ${pred && html`
      <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
        <div class="font-semibold text-slate-800 mb-3">Прогноз</div>
        <div class="space-y-2.5 text-sm">
          <div class="flex flex-col justify-between items-baseline gap-2">
            <span class="text-slate-500 shrink-0">Менструация</span>
            <span class="font-medium text-right">${fmtShort(pred.nextStart)} – ${fmtShort(pred.periodEnd)}</span></div>
          <div class="flex flex-col justify-between items-baseline gap-2">
            <span class="text-slate-500 shrink-0">Овуляция (оценка)</span>
            <span class="font-medium text-violet-600 text-right">${fmtLong(pred.ovulation)}</span></div>
          <div class="flex flex-col justify-between items-baseline gap-2">
            <span class="text-slate-500 shrink-0">Фертильное окно</span>
            <span class="font-medium text-violet-600 text-right">${fmtShort(pred.fertileStart)} – ${fmtShort(pred.fertileEnd)}</span></div>
        </div>
      </div>`}

    <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
      <div class="font-semibold text-slate-800 mb-3">Интимная жизнь</div>
      ${sexTotal ? html`
        <div class="space-y-2.5 text-sm">
          <div class="flex flex-col justify-between items-baseline gap-2">
            <span class="text-slate-500 shrink-0">Всего</span>
            <span class="font-medium text-right">${sexTotal} ${timesWord(sexTotal)}</span></div>
          <div class="flex flex-col justify-between items-baseline gap-2">
            <span class="text-slate-500 shrink-0">В этом месяце</span>
            <span class="font-medium text-right">${sexMonth} ${timesWord(sexMonth)}</span></div>
          <div class="flex flex-col justify-between items-baseline gap-2">
            <span class="text-slate-500 shrink-0">Последний раз</span>
            <span class="font-medium text-right">${fmtLong(lastSex)} ${lastSex.getFullYear()}</span></div>
          <div class="flex flex-col justify-between items-baseline gap-2">
            <span class="text-slate-500 shrink-0">Средняя частота</span>
            <span class="font-medium text-rose-600 text-right">${sexAvgGap != null ? 'каждые ' + sexAvgGap + ' дн.' : 'нужно 2 и более отметки'}</span></div>
        </div>` : html`
        <div class="text-sm text-slate-400">Отметки половых актов появятся здесь - добавьте их в панели дня на вкладке "Календарь".</div>`}
    </div>

    ${ctx.cycles.length > 0 && html`
      <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
        <div class="flex items-center justify-between mb-3">
          <button onClick=${() => setSelYear(y - 1)} disabled=${y <= minY}
            aria-label="Предыдущий год"
            class=${'w-9 h-9 rounded-full text-lg transition ' + (y <= minY ? 'text-slate-300' : 'text-slate-600 hover:bg-rose-50')}>
            <i class="fa-solid fa-chevron-left"></i></button>
          <div class="font-semibold text-slate-800">История циклов · ${y}</div>
          <button onClick=${() => setSelYear(y + 1)} disabled=${y >= maxY}
            aria-label="Следующий год"
            class=${'w-9 h-9 rounded-full text-lg transition ' + (y >= maxY ? 'text-slate-300' : 'text-slate-600 hover:bg-rose-50')}>
            <i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="space-y-2.5">
          ${items.length ? items.map(c => {
            const ovPos = Math.min(96, Math.max(2, (c.ovDay - 0.5) / c.cycleLen * 100));
            return html`
              <div key=${c.startKey}>
                <div class="flex justify-between text-xs text-slate-500 mb-1">
                  <span>${fmtShort(c.start)}</span><span>${c.cycleLen} дн.</span>
                </div>
                <div class="relative h-3 rounded-full bg-slate-100 overflow-hidden flex">
                  <div class="h-full bg-rose-500" style=${'width:' + Math.min(100, c.periodLen / c.cycleLen * 100) + '%'}></div>
                  <div class="h-full bg-violet-200 flex-1"></div>
                  <div class="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-600"
                    style=${'left:' + ovPos + '%'}></div>
                </div>
              </div>`;
          }) : html`
            <div class="text-sm text-slate-400 py-2 text-center">За ${y} год нет завершенных циклов.</div>`}
        </div>
        <div class="text-xs text-slate-400 mt-3">
          ${items.length ? items.length + ' ' + cycleWord(items.length) + ' · ' : ''}розовый - дни менструации, сиреневый - остальная часть цикла, точка - овуляция.
        </div>
      </div>`}

    <p class="text-xs text-slate-400 px-1">Прогнозы оценочные и основаны на средней длине вашего цикла. Приложение не является средством контрацепции и не заменяет консультацию врача.</p>
  `;
}
