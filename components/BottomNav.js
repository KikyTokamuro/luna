import { t } from '../lib/i18n.js';
import { html } from '../lib/html.js';

const TABS = [
  ['calendar', 'fa-calendar-days', "nav.calendar"],
  ['stats', 'fa-chart-column', "nav.stats"],
  ['settings', 'fa-gear', "nav.settings"]
];

/**
 * Bottom tab navigation.
 * @param {{
 *   tab: string, 
 *   onTab: (id: string) => void
 * }} props
 */
export default function BottomNav({ tab, onTab }) {
  return html`
    <nav class="fixed bottom-0 inset-x-0 z-10 bg-white border-t border-rose-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div class="max-w-lg mx-auto grid grid-cols-3">
        ${TABS.map(([id, icon, label]) => html`
          <button key=${id} onClick=${() => onTab(id)}
            class=${'py-2.5 text-center transition ' + (tab === id ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600')}>
            <div class="text-lg leading-none"><i class=${'fa-solid ' + icon}></i></div>
            <div class="text-xs mt-1">${t(label)}</div>
          </button>`)}
      </div>
    </nav>
  `;
}
