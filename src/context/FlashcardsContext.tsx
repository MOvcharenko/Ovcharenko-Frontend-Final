import { createContext, useContext, type ReactNode } from 'react';
import { useFlashcardsStore, type FlashcardsStore } from '../store/flashcardsStore';

type FlashcardsContextType = FlashcardsStore;

const FlashcardsContext = createContext<FlashcardsContextType | null>(null);

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const flashcards = useFlashcardsStore();

  return (
    <FlashcardsContext.Provider value={flashcards}>
      {children}
    </FlashcardsContext.Provider>
  );
}

export function useFlashcardsContext() {
  const ctx = useContext(FlashcardsContext);
  if (!ctx) throw new Error('useFlashcardsContext must be used inside FlashcardsProvider');
  return ctx;
}