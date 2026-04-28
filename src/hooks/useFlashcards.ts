import type { AppState } from '../types';
import { useFlashcardsStore, DEFAULT_STATE } from '../store/flashcardsStore';

// wrapper hook that exposes store data in same shape as before
export function useFlashcards(initialState: AppState = DEFAULT_STATE) {
  // optionally initialize store with provided state (used in tests)
  if (initialState !== DEFAULT_STATE) {
    useFlashcardsStore.setState(initialState);
  }

  const store = useFlashcardsStore();
  const { decks, activeSession, ...rest } = store;
  return {
    state: { decks, activeSession },
    ...rest,
  };
}