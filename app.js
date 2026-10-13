import { render } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { registerSW } from 'virtual:pwa-register';

import './styles.css';

import { html } from './lib/html.js';
import { toKey } from './lib/dates.js';
import { kvGet, all, putRec, delRec, clearStore, kvSet, STORE_PERIODS, STORE_LOGS, STORE_KV } from './lib/db.js';
import { buildCtx, predict, statusOf } from './lib/cycle.js';
import { DEFAULT_SETTINGS } from './lib/constants.js';

import Header from './components/Header.js';
import BottomNav from './components/BottomNav.js';
import CalendarView from './views/CalendarView.js';
import StatsView from './views/StatsView.js';
import SettingsView from './views/SettingsView.js';

/**
 * Запись лога "пустая" - нет ни симптомов, ни заметки, ни отметки полового акта.
 * Такие записи не храним: при сохранении удаляются из БД.
 * @param {{
 *   symptoms?: string[],
 *   note?: string,
 *   sex?: boolean
 * }} rec
 * @returns {boolean}
 */
const isEmptyLog = rec => !(rec.symptoms && rec.symptoms.length) && !(rec.note || '').trim() && !rec.sex;

/**
 * @property {Date} today текущий день (один раз на сессию)
 * @property {string} tab активная вкладка: calendar | stats | settings
 * @property {Set<string>} periodSet дни месячных (ключи 'YYYY-MM-DD')
 * @property {Record<string, object>} logs логи по дате: {date, note, symptoms[], sex?}
 * @property {{cycle: number, period: number}} settings дефолтная длина цикла/месячных
 * @property {string} selKey выбранная в календаре дата
 */
function App() {
  const today = useMemo(() => { 
    const d = new Date(); 
    d.setHours(0, 0, 0, 0); 
    return d; 
  }, []);
  
  const todayKey = toKey(today);
  const [tab, setTab] = useState('calendar');
  const [periodSet, setPeriodSet] = useState(new Set());
  const [logs, setLogs] = useState({});
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selKey, setSelKey] = useState(todayKey);
  const [noteDraft, setNoteDraft] = useState('');
  const [installEvt, setInstallEvt] = useState(null);

  // Начальная загрузка + миграция: пустые записи логов (без симптомов, заметки
  // и отметки полового акта) удаляем из БД, чтобы не оставались "мусорные" точки на календаре.
  useEffect(() => {
    (async () => {
      try {
        const [days, logRows, st] = await Promise.all([all(STORE_PERIODS), all(STORE_LOGS), kvGet('settings')]);

        // Миграция: убираем отметки будущих дат (могли попасть из старых
        // версий или бэкапа) - они искажают день цикла и прогноз.
        for (const x of days) {
          if (x.date > todayKey) await delRec(STORE_PERIODS, x.date);
        }

        setPeriodSet(new Set(days.filter(x => x.date <= todayKey).map(x => x.date)));
        const m = {};
      
        for (const r of logRows) {
          if (isEmptyLog(r)) {
            await delRec(STORE_LOGS, r.date);
          } else {
            m[r.date] = r;
          }
        }
      
        setLogs(m);
      
        if (st) setSettings(st);
      } catch (e) { 
        console.error(e); 
      }
      
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    const h = e => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  useEffect(() => {
    const l = logs[selKey];
    setNoteDraft(l ? (l.note || '') : '');
  }, [selKey, logs]);

  const ctx = useMemo(() => buildCtx(periodSet, settings), [periodSet, settings]);
  const pred = useMemo(() => predict(ctx), [ctx]);
  const stSel = useMemo(() => statusOf(selKey, periodSet, ctx), [selKey, periodSet, ctx]);
  const selLog = logs[selKey] || null;

  /** 
   * Переключение дня: ставит/снимает отметку месячных в БД и в состоянии. 
   * @param {string} key 
   */
  const togglePeriod = async key => {
    if (key > todayKey) return;

    const next = new Set(periodSet);

    if (next.has(key)) { 
      next.delete(key); 
      await delRec(STORE_PERIODS, key); 
    } else { 
      next.add(key); 
      await putRec(STORE_PERIODS, { date: key }); 
    }
    
    setPeriodSet(next);
  };

  /**
   * Единая точка записи лога дня: если запись пуста - удаляем ее из БД, иначе сохраняем.
   * @param {string} key дата
   * @param {{
   *   date: string, 
   *   note: string, 
   *   symptoms: string[]
   * }} rec
   */
  const saveLog = async (key, rec) => {
    if (key > todayKey) return;

    const next = { ...logs };

    if (isEmptyLog(rec)) {
      await delRec(STORE_LOGS, key);
      delete next[key];
    } else {
      await putRec(STORE_LOGS, rec);
      next[key] = rec;
    }
    
    setLogs(next);
  };

  /** 
   * Добавляет/убирает симптом в логе выбранного дня. 
   * @param {string} sym 
   */
  const toggleSymptom = async sym => {
    const cur = logs[selKey] || { date: selKey, note: '', symptoms: [] };
    const syms = cur.symptoms.includes(sym) 
      ? cur.symptoms.filter(x => x !== sym) 
      : [...cur.symptoms, sym];
    
    await saveLog(selKey, { ...cur, date: selKey, symptoms: syms });
  };

  /**
   * Ставит/снимает отметку полового акта в логе выбранного дня.
   */
  const toggleSex = async () => {
    if (selKey > todayKey) return;

    const cur = logs[selKey] || { date: selKey, note: '', symptoms: [] };

    await saveLog(selKey, { ...cur, date: selKey, sex: !cur.sex });
  };

  /** 
   * Сохраняет черновик заметки. 
   */
  const saveNote = async () => {
    const cur = logs[selKey] || { date: selKey, note: '', symptoms: [] };
    
    if ((cur.note || '') === noteDraft) return;

    await saveLog(selKey, { ...cur, date: selKey, note: noteDraft });
  };

  /** 
   * Показывает нативный диалог установки PWA (если браузер предложил). 
   */
  const doInstall = async () => {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null);
  };

  /**
   * Импорт бэкапа JSON: полностью заменяет локальные данные
   * (periodDays, logs, settings). Пустые логи из файла отбрасываются.
   * @param {Event} e change-событие <input type="file">
   */
  const importData = e => {
    const f = e.target.files[0];
    if (!f) return;

    const rd = new FileReader();
    
    rd.onload = async () => {
      try {
        const data = JSON.parse(rd.result);
        if (!Array.isArray(data.periods)) throw new Error('bad file');

        const periods = data.periods.filter(d => typeof d === 'string' && d <= todayKey);
        const logRows = (data.logs || []).filter(l => !isEmptyLog(l) && l.date <= todayKey);
        
        await clearStore(STORE_PERIODS); 
        await clearStore(STORE_LOGS);
        
        for (const d of periods) {
          await putRec(STORE_PERIODS, { date: d });
        }

        for (const l of logRows) {
          await putRec(STORE_LOGS, l);
        }

        if (data.settings) { 
          await kvSet('settings', data.settings); 
          setSettings(data.settings); 
        }
        
        setPeriodSet(new Set(periods));
        
        const m = {}; 
        logRows.forEach(r => m[r.date] = r); 
        setLogs(m);
        
        alert('Данные восстановлены');
      } catch (err) { 
        alert('Не удалось импортировать файл'); 
      }
      e.target.value = '';
    };
    
    rd.readAsText(f);
  };

  /** 
   * Полная очистка БД + сброс состояния в дефолты. 
   */
  const clearAll = async () => {
    if (!confirm('Удалить все данные приложения? Это действие необратимо.')) return;
    
    await clearStore(STORE_PERIODS); 
    await clearStore(STORE_LOGS); 
    await clearStore(STORE_KV);
    
    setPeriodSet(new Set()); 
    setLogs({}); 
    setSettings(DEFAULT_SETTINGS);
  };

  if (!ready) {
    return html`<div class="min-h-screen flex items-center justify-center text-rose-500">Загрузка…</div>`;
  }

  return html`
    <div class="min-h-screen pb-24">
      <${Header} installEvt=${installEvt} onInstall=${doInstall} />

      <main class="max-w-xl mx-auto px-4 pt-4 space-y-4">
        ${tab === 'calendar' && html`
          <${CalendarView}
            today=${today} todayKey=${todayKey}
            month=${month} setMonth=${setMonth}
            selKey=${selKey} setSelKey=${setSelKey}
            periodSet=${periodSet} logs=${logs}
            ctx=${ctx} stSel=${stSel} selLog=${selLog}
            onTogglePeriod=${togglePeriod} onToggleSymptom=${toggleSymptom}
            onToggleSex=${toggleSex}
            noteDraft=${noteDraft} setNoteDraft=${setNoteDraft} onSaveNote=${saveNote} />`}

        ${tab === 'stats' && html`
          <${StatsView} today=${today} ctx=${ctx} pred=${pred} logs=${logs} />`}

        ${tab === 'settings' && html`
          <${SettingsView}
            settings=${settings} setSettings=${setSettings}
            periodSet=${periodSet} logs=${logs}
            onImport=${importData} onClearAll=${clearAll} />`}
      </main>

      <${BottomNav} tab=${tab} onTab=${setTab} />
    </div>`;
}

render(html`<${App} />`, document.getElementById('app'));

// Регистрация service worker, сгенерированного vite-plugin-pwa:
// precache всего билда, обновление кэша автоматически (autoUpdate).
registerSW({ immediate: true });
