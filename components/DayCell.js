import { html } from '../lib/html.js';
import { toKey } from '../lib/dates.js';

/**
 * Ячейка дня в календаре.
 * @param {{
 *   d: Date|null, 
 *   selKey: string, 
 *   onSel: (key: string) => void,
 *   st: {
 *     period: boolean, 
 *     predicted: boolean, 
 *     ovulation: boolean, 
 *     fertile: boolean
 *   },
 *   hasLog: boolean, 
 *   today: boolean
 * }} props
 */
export default function DayCell({ d, selKey, onSel, st, hasLog, today }) {
  if (!d) return html`<div></div>`;

  const key = toKey(d);
  let cls = 'relative h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm select-none cursor-pointer transition ';
  
  if (st.period) cls += 'bg-rose-500 text-white font-semibold ';
  else if (st.predicted) cls += 'bg-rose-200 text-rose-900 ';
  else if (st.ovulation) cls += 'bg-violet-500 text-white font-semibold ';
  else if (st.fertile) cls += 'bg-violet-100 text-violet-800 ';
  else cls += 'text-slate-700 hover:bg-rose-50 ';
  
  if (today) cls += 'ring-2 ring-rose-400 ring-offset-1 ';
  
  if (key === selKey) cls += 'outline outline-2 outline-slate-500 ';
  
  return html`
    <div class=${cls} onClick=${() => onSel(key)}>
      ${d.getDate()}
      ${hasLog && html`<i class="fa-solid fa-circle absolute bottom-1 text-[4px] ${st.period ? 'text-white' : 'text-slate-400'}"></i>`}
    </div>
  `;
}
