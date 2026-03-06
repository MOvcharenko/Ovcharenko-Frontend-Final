import type { AppState } from '../types';
import { useFlashcardsStore, DEFAULT_STATE } from '../store/flashcardsStore';

// wrapper hook that exposes store data in same shape as before
export function useFlashcards(initialState: AppState = DEFAULT_STATE) {
  // optionally initialize store with provided state (used in tests)
  if (initialState !== DEFAULT_STATE) {
    useFlashcardsStore.setState(initialState);
  }

  // separate selectors to avoid returning a new object on every render
  const decks = useFlashcardsStore((s) => s.decks);
  const activeSession = useFlashcardsStore((s) => s.activeSession);
  const state: AppState = { decks, activeSession };

  // bind actions directly from store
  const addDeck = useFlashcardsStore((s) => s.addDeck);
  const deleteDeck = useFlashcardsStore((s) => s.deleteDeck);
  const updateDeck = useFlashcardsStore((s) => s.updateDeck);

  const addCard = useFlashcardsStore((s) => s.addCard);
  const deleteCard = useFlashcardsStore((s) => s.deleteCard);
  const updateCard = useFlashcardsStore((s) => s.updateCard);
  const resetCard = useFlashcardsStore((s) => s.resetCard);
  const resetDeck = useFlashcardsStore((s) => s.resetDeck);

  const startSession = useFlashcardsStore((s) => s.startSession);
  const rateCard = useFlashcardsStore((s) => s.rateCard);
  const endSession = useFlashcardsStore((s) => s.endSession);

  const getDeckById = useFlashcardsStore((s) => s.getDeckById);
  const getCardsDueToday = useFlashcardsStore((s) => s.getCardsDueToday);
  const getSessionStats = useFlashcardsStore((s) => s.getSessionStats);
  const getDeckStats = useFlashcardsStore((s) => s.getDeckStats);

  return {
    state,
    addDeck,
    deleteDeck,
    updateDeck,
    addCard,
    deleteCard,
    updateCard,
    resetCard,
    resetDeck,
    startSession,
    rateCard,
    endSession,
    getDeckById,
    getCardsDueToday,
    getSessionStats,
    getDeckStats,
  };
}