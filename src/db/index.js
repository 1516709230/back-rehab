import { openDB } from 'idb';

const DB_NAME = 'back-rehab';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('dailyLogs')) {
        const logStore = db.createObjectStore('dailyLogs', { keyPath: 'date' });
        logStore.createIndex('byDate', 'date', { unique: true });
      }
      if (!db.objectStoreNames.contains('painRecords')) {
        const painStore = db.createObjectStore('painRecords', { keyPath: 'date' });
        painStore.createIndex('byDate', 'date', { unique: true });
      }
      if (!db.objectStoreNames.contains('assessments')) {
        const assessStore = db.createObjectStore('assessments', { keyPath: 'id', autoIncrement: true });
        assessStore.createIndex('byDate', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

let dbInstance = null;

async function getDB() {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}

export async function saveDailyLog(log) {
  const db = await getDB();
  return db.put('dailyLogs', log);
}

export async function getDailyLog(date) {
  const db = await getDB();
  return db.get('dailyLogs', date);
}

export async function getLogsInRange(startDate, endDate) {
  const db = await getDB();
  return db.getAllFromRange('dailyLogs', IDBKeyRange.bound(startDate, endDate));
}

export async function savePainRecord(record) {
  const db = await getDB();
  return db.put('painRecords', record);
}

export async function getPainRecords() {
  const db = await getDB();
  return db.getAll('painRecords');
}

export async function saveAssessment(result) {
  const db = await getDB();
  return db.add('assessments', result);
}

export async function getAssessments() {
  const db = await getDB();
  return db.getAll('assessments');
}

export async function getLatestAssessment() {
  const assessments = await getAssessments();
  return assessments.sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
}

export async function saveSetting(key, value) {
  const db = await getDB();
  return db.put('settings', { key, value });
}

export async function getSetting(key) {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result ? result.value : null;
}
