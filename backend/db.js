const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const EMPTY_DB = {
  people: [],
  locations: [],
  organizations: [],
  vehicles: [],
  phones: [],
  relationships: [],
  cases: [],
  reports: []
};

function ensureDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
  }
}

function readDB() {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return { ...EMPTY_DB, ...JSON.parse(raw) };
  } catch (err) {
    return { ...EMPTY_DB };
  }
}

function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
