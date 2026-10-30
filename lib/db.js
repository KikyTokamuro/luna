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

/** The connection is opened once and reused. */
const db = () => dbp || (dbp = openDB());

/** 
 * IDBRequest -> Promise. 
 * @template T 
 * @param {IDBRequest<T>} r 
 * @returns {Promise<T>} 
 */
const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

/** 
 * Create a transaction and access its object store. 
 * @param {string} name 
 * @param {IDBTransactionMode} mode 
 */
const store = async (name, mode) => (await db()).transaction(name, mode).objectStore(name);

/** 
 * Read a value from kv by key. 
 * @param {string} k 
 * @returns {Promise<any>} 
 */
export const kvGet = async k => req((await store(STORE_KV, 'readonly')).get(k));

/** 
 * Write a value to kv. 
 * @param {string} k 
 * @param {any} v 
 */
export const kvSet = async (k, v) => { await req((await store(STORE_KV, 'readwrite')).put(v, k)); };

/** 
 * All records in the store (an empty array if there are none). 
 * @param {string} name 
 * @returns {Promise<object[]>} 
 */
export const all = async name => (await req((await store(name, 'readonly')).getAll())) || [];

/** 
 * Put a record using its key (keyPath 'date'). 
 * @param {string} name 
 * @param {{date: string}} v 
 */
export const putRec = async (name, v) => { await req((await store(name, 'readwrite')).put(v)); };

/** 
 * Delete a record by key (date). 
 * @param {string} name 
 * @param {string} k 
 */
export const delRec = async (name, k) => { await req((await store(name, 'readwrite')).delete(k)); };

/** 
 * Clear the entire store. 
 * @param {string} name 
 */
export const clearStore = async name => { await req((await store(name, 'readwrite')).clear()); };
