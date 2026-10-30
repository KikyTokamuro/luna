import { t } from '../lib/i18n.js';
import { html } from '../lib/html.js';
import { kvSet } from '../lib/db.js';
import { APP_NAME, APP_VERSION, AUTHOR_URL } from '../lib/constants.js';

/**
 * Settings tab.
 * @param {{
 *   settings: object, 
 *   setSettings: (s: object) => void,
 *   periodSet: Set<string>, 
 *   logs: Record<string, object>,
 *   onImport: (e: Event) => void, 
 *   onClearAll: () => void
 * }} props
 */
export default function SettingsView({ settings, setSettings, periodSet, logs, onImport, onClearAll }) {
  /** Export {version, settings, periods, logs} as a JSON file. */
  const exportData = () => {
    const data = { version: 1, settings, periods: [...periodSet].sort(), logs: Object.values(logs) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'luna-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return html`
    <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
      <div id="language-heading" class="font-semibold text-slate-800 mb-3">${t("settings.language")}</div>
      <div class="grid grid-cols-2 gap-3" role="group" aria-labelledby="language-heading">
        ${[['ru', 'Русский'], ['en', 'English']].map(([language, label]) => {
          const selected = (settings.language || 'ru') === language;
          return html`
            <button type="button" key=${language} lang=${language} aria-pressed=${selected}
              onClick=${() => {
                const next = { ...settings, language };
                setSettings(next);
                kvSet('settings', next);
              }}
              class=${'flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ' +
                (selected ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-200')}>
              <span>${label}</span>
              <i aria-hidden="true" class=${'fa-solid fa-check ' + (selected ? '' : 'invisible')}></i>
            </button>`;
        })}
      </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
      <div class="font-semibold text-slate-800 mb-3">${t("settings.defaults")}</div>
      <p class="text-xs text-slate-400 mb-3">${t("settings.defaultsDescription")}</p>
      <label class="flex items-center justify-between py-2">
        <span class="text-sm text-slate-600">${t("settings.cycleLength")}</span>
        <input type="number" min="15" max="90" value=${settings.cycle}
          onInput=${e => setSettings({ ...settings, cycle: Math.max(15, Math.min(90, +e.target.value || 28)) })}
          class="w-20 border border-slate-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
      </label>
      <label class="flex items-center justify-between py-2">
        <span class="text-sm text-slate-600">${t("settings.periodLength")}</span>
        <input type="number" min="1" max="10" value=${settings.period}
          onInput=${e => setSettings({ ...settings, period: Math.max(1, Math.min(10, +e.target.value || 5)) })}
          class="w-20 border border-slate-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
      </label>
      <button onClick=${() => kvSet('settings', settings)}
        class="mt-2 text-sm bg-rose-600 text-white rounded-full px-4 py-2 hover:bg-rose-700 transition"><i class="fa-solid fa-floppy-disk mr-1.5"></i>${t("common.save")}</button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
      <div class="font-semibold text-slate-800 mb-3">${t("settings.data")}</div>
      <p class="text-xs text-slate-400 mb-3">${t("settings.dataDescription")}</p>
      <div class="flex flex-wrap gap-2">
        <button onClick=${exportData} class="text-sm border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50 transition"><i class="fa-solid fa-file-export mr-1.5"></i>${t("settings.export")}</button>
        <label class="text-sm border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50 transition cursor-pointer">
          <i class="fa-solid fa-file-import mr-1.5"></i>${t("settings.import")}
          <input type="file" accept="application/json" class="hidden" onChange=${onImport} />
        </label>
        <button onClick=${onClearAll} class="text-sm border border-rose-200 text-rose-600 rounded-full px-4 py-2 hover:bg-rose-50 transition"><i class="fa-solid fa-trash-can mr-1.5"></i>${t("settings.deleteAll")}</button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-rose-100 p-4">
      <div class="font-semibold text-slate-800 mb-3">${t("settings.version")}</div>
      <div class="flex items-baseline justify-between gap-2 text-sm">
        <span class="text-slate-600">${t(APP_NAME)}</span>
        <span class="font-medium text-slate-800 shrink-0">v${APP_VERSION}</span>
      </div>
      <a href=${AUTHOR_URL} target="_blank" rel="noopener noreferrer"
        class="mt-2 inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 transition">
        <i class="fa-solid fa-globe"></i>${t("settings.author")}
      </a>
    </div>
  `;
}
