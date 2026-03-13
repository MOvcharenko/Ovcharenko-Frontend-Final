import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AppState } from '../src/types';

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// mirror the client DEFAULT_STATE shape
const DEFAULT_STATE: AppState = {
  decks: [],
  activeSession: null,
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDb(): AppState {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return DEFAULT_STATE;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    try {
      const state = JSON.parse(raw) as AppState;
      return state;
    } catch (err) {
      console.error('Corrupted db.json, resetting to default state', err);
      return DEFAULT_STATE;
    }
  } catch (err) {
    console.error('Error reading database file', err);
    return DEFAULT_STATE;
  }
}

export function writeDb(state: AppState): void {
  try {
    ensureDataDir();
    const tmpPath = DB_PATH + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_PATH);
  } catch (err) {
    console.error('Error writing database file', err);
    // we don't throw so the server can continue running
  }
}
