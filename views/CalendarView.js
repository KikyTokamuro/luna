import { html } from '../lib/html.js';
import { MONTHS, WD, toKey, fromKey, fmtLong, monthGrid } from '../lib/dates.js';
import { statusOf, phaseName } from '../lib/cycle.js';
import { SYMPTOMS } from '../lib/constants.js';
import DayCell from '../components/DayCell.js';

/**
 * Вкладка "Календарь".
 * @param {object} props
 * @param {Date} props.today
 * @param {string} props.todayKey
 * @param {Date} props.month первый день отображаемого месяца
 * @param {(m: Date) => void} props.setMonth
 * @param {string} props.selKey выбранная дата
 * @param {(key: string) => void} props.setSelKey
 * @param {Set<string>} props.periodSet
 * @param {Record<string, object>} props.logs
 * @param {object} props.ctx
 * @param {object} props.stSel статус выбранного дня
 * @param {object|null} props.selLog лог выбранного дня
 * @param {(key: string) => void} props.onTogglePeriod
 * @param {(sym: string) => void} props.onToggleSymptom
 * @param {() => void} props.onToggleSex
 * @param {string} props.noteDraft черновик заметки
 * @param {(v: string) => void} props.setNoteDraft
 * @param {() => void} props.onSaveNote
 */
export default function CalendarView({
  today, todayKey, month, setMonth, selKey, setSelKey,
  periodSet, logs, ctx, stSel, selLog,
  onTogglePeriod, onToggleSymptom, onToggleSex,
  noteDraft, setNoteDraft, onSaveNote
}) {
  const cells = monthGrid(month.getFullYear(), month.getMonth());
  const isFuture = selKey > todayKey;

  return html`
    <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
      <div class="flex items-center justify-between mb-3">
        <button onClick=${() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          aria-label="Предыдущий месяц" class="w-9 h-9 rounded-full hover:bg-rose-50 text-slate-600 text-lg"><i class="fa-solid fa-chevron-left"></i></button>
        <div class="font-semibold text-slate-800">${MONTHS[month.getMonth()]} ${month.getFullYear()}</div>
        <button onClick=${() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          aria-label="Следующий месяц" class="w-9 h-9 rounded-full hover:bg-rose-50 text-slate-600 text-lg"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-1">
        ${WD.map(w => html`<div key=${w} class="text-center text-xs text-slate-400 py-1">${w}</div>`)}
      </div>
      <div class="grid grid-cols-7 gap-y-1.5">
        ${cells.map((d, i) => d ? html`
          <${DayCell} key=${toKey(d)} d=${d} selKey=${selKey} onSel=${setSelKey}
            st=${statusOf(toKey(d), periodSet, ctx)} hasLog=${!!logs[toKey(d)]} today=${toKey(d) === todayKey} />`
          : html`<div key=${'e' + i}></div>`)}
      </div>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-xs text-slate-500">
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle text-rose-500 text-[10px]"></i>Менструация</span>
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle text-rose-200 text-[10px]"></i>Прогноз</span>
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle text-violet-500 text-[10px]"></i>Овуляция</span>
        <span class="flex items-center gap-1.5"><i class="fa-solid fa-circle text-violet-100 text-[10px]"></i>Фертильные дни</span>
      </div>
      <button onClick=${() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelKey(todayKey); }}
        class="mt-3 w-full text-sm text-rose-600 hover:bg-rose-50 rounded-xl py-2 transition"><i class="fa-solid fa-calendar-day mr-1.5"></i>Сегодня</button>
    </div>

    ${!periodSet.size && html`
      <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-800">
        Начните вести календарь: нажмите на день начала менструации и отметьте его кнопкой ниже. Приложение рассчитает цикл, овуляцию и фертильное окно.
      </div>`}

    <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="font-semibold text-slate-800">${fmtLong(fromKey(selKey))}</div>
          <div class="text-sm text-slate-500 mt-0.5">
            ${phaseName(stSel, ctx)}${stSel.cycleDay != null ? ' · день цикла ' + stSel.cycleDay : ''}
          </div>
        </div>
        ${!isFuture && html`
        <button onClick=${() => onTogglePeriod(selKey)}
          class=${'text-sm rounded-full px-4 py-2 transition ' +
            (stSel.period ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-rose-600 text-white hover:bg-rose-700')}>
          ${stSel.period ? html`<i class="fa-solid fa-xmark mr-1"></i>Убрать отметку`
                         : html`<i class="fa-solid fa-droplet mr-1"></i>Менструация`}
        </button>`}
      </div>

      ${isFuture ? html`
        <div class="mt-4 text-sm text-slate-400">
          <i class="fa-solid fa-lock mr-1.5"></i>Отметки за будущие дни недоступны - данные вносятся только по факту, чтобы не искажать расчеты.
        </div>` : html`
      <div class="mt-4">
        <div class="text-xs text-slate-500 mb-2">Симптомы</div>
        <div class="flex flex-wrap gap-2">
          ${SYMPTOMS.map(s => html`
            <button key=${s} onClick=${() => onToggleSymptom(s)}
              class=${'text-xs rounded-full px-3 py-1.5 border transition ' +
                ((selLog && selLog.symptoms || []).includes(s)
                  ? 'bg-violet-100 border-violet-300 text-violet-800'
                  : 'border-slate-200 text-slate-600 hover:border-violet-300')}>
              ${s}
            </button>`)}
        </div>
      </div>

      <div class="mt-4">
        <div class="text-xs text-slate-500 mb-2">Интимная жизнь</div>
        <button onClick=${onToggleSex}
          class=${'text-sm rounded-full px-4 py-2 transition ' +
            (selLog && selLog.sex
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              : 'bg-rose-600 text-white hover:bg-rose-700')}>
          ${selLog && selLog.sex
            ? html`<i class="fa-solid fa-xmark mr-1.5"></i>Убрать отметку`
            : html`<i class="fa-solid fa-heart mr-1.5"></i>Половой акт`}
        </button>
      </div>

      <div class="mt-4">
        <div class="text-xs text-slate-500 mb-2">Заметка</div>
        <textarea rows="2" value=${noteDraft} onInput=${e => setNoteDraft(e.target.value)}
          placeholder="Настроение, самочувствие, наблюдения…"
          class="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"></textarea>
        <button onClick=${onSaveNote}
          class="mt-2 text-sm bg-slate-800 text-white rounded-full px-4 py-2 hover:bg-slate-700 transition"><i class="fa-solid fa-floppy-disk mr-1.5"></i>Сохранить</button>
      </div>`}
    </div>
  `;
}
