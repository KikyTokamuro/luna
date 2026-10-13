export const STORE_PERIODS = 'periodDays';
export const STORE_LOGS = 'logs';
export const STORE_KV = 'kv';

/** 
 * @returns {Promise<IDBDatabase>} 
 */
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('luna-db', 1);
    r.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_KV)) db.createObjectStore(STORE_KV);
      if (!db.objectStoreNames.contains(STORE_PERIODS)) db.createObjectStore(STORE_PERIODS, { keyPath: 'date' });
      if (!db.objectStoreNames.contains(STORE_LOGS)) db.createObjectStore(STORE_LOGS, { keyPath: 'date' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

let dbp;

/** Соединение открывается один раз и переиспользуется. */
const db = () => dbp || (dbp = openDB());

/** 
 * IDBRequest -> Promise. 
 * @template T 
 * @param {IDBRequest<T>} r 
 * @returns {Promise<T>} 
 */
const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

/** 
 * Одноразовая транзакция + store в ней. 
 * @param {string} name 
 * @param {IDBTransactionMode} mode 
 */
const store = async (name, mode) => (await db()).transaction(name, mode).objectStore(name);

/** 
 * Чтение значения из kv по ключу. 
 * @param {string} k 
 * @returns {Promise<any>} 
 */
export const kvGet = async k => req((await store(STORE_KV, 'readonly')).get(k));

/** 
 * Запись значения в kv. 
 * @param {string} k 
 * @param {any} v 
 */
export const kvSet = async (k, v) => { await req((await store(STORE_KV, 'readwrite')).put(v, k)); };

/** 
 * Все записи store'а (пустой массив, если их нет). 
 * @param {string} name 
 * @returns {Promise<object[]>} 
 */
export const all = async name => (await req((await store(name, 'readonly')).getAll())) || [];

/** 
 * put по ключу record'а (keyPath 'date'). 
 * @param {string} name 
 * @param {{date: string}} v 
 */
export const putRec = async (name, v) => { await req((await store(name, 'readwrite')).put(v)); };

/** 
 * Удаление записи по ключу (дате). 
 * @param {string} name 
 * @param {string} k 
 */
export const delRec = async (name, k) => { await req((await store(name, 'readwrite')).delete(k)); };

/** 
 * Очистить весь store. 
 * @param {string} name 
 */
export const clearStore = async name => { await req((await store(name, 'readwrite')).clear()); };
