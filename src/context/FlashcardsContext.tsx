import { createContext, useContext, type ReactNode, useEffect, useMemo } from 'react';
import { useFlashcardsStore, type FlashcardsStore } from '../store/flashcardsStore';

type FlashcardsContextType = FlashcardsStore;

const FlashcardsContext = createContext<FlashcardsContextType | null>(null);

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const flashcards = useFlashcardsStore();

  const memoizedFlashcards = useMemo(() => flashcards, [
    flashcards.decks,
    flashcards.activeSession,
    flashcards.loading,
    flashcards.error,
    // actions are stable from store
  ]);

  useEffect(() => {
    flashcards.loadDecks();
  }, []); // empty dependency, only on mount

  return (
    <FlashcardsContext.Provider value={memoizedFlashcards}>
      {children}
    </FlashcardsContext.Provider>
  );
}

export function useFlashcardsContext() {
  const ctx = useContext(FlashcardsContext);
  if (!ctx) throw new Error('useFlashcardsContext must be used inside FlashcardsProvider');
  return ctx;
}