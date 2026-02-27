import type { AppState } from '../types';

const STORAGE_KEY = 'flashflow_state';

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save state to localStorage');
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}