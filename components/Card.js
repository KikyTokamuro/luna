import { html } from '../lib/html.js';

/**
 * Statistics card.
 * @param {{
 *   title: string, 
 *   value: string|number, 
 *   sub?: string, 
 *   accent?: string
 * }} props
 */
export default function Card({ title, value, sub, accent }) {
  return html`
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
      <div class="text-xs text-slate-500 mb-1">${title}</div>
      <div class=${'text-2xl font-semibold ' + (accent || 'text-slate-800')}>${value}</div>
      ${sub && html`<div class="text-xs text-slate-400 mt-1">${sub}</div>`}
    </div>
  `;
}
