import { html } from '../lib/html.js';

/**
 * Application header.
 * @param {{
 *   installEvt: object|null, 
 *   onInstall: () => void
 * }} props
 */
export default function Header({ installEvt, onInstall }) {
  return html`
    <header class="sticky top-0 z-10 bg-rose-600 text-white shadow-sm">
      <div class="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-droplet text-xl"></i>
          <h1 class="font-semibold text-lg">Луна - календарь цикла</h1>
        </div>
        ${installEvt && html`
          <button onClick=${onInstall}
            class="text-xs bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition">
            <i class="fa-solid fa-download mr-1"></i>Установить
          </button>`}
      </div>
    </header>
  `;
}
