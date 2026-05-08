import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppState,
  Card,
  Deck,
  Rating,
} from '../types';
import { isCardDueToday, computeNextReview } from '../utils/srs';

// helpers
function todayISO(): string {
  return new Date().toISOString();
}

export const DEFAULT_STATE: AppState = {
  decks: [],
  activeSession: null,
};

export interface FlashcardsStore extends AppState {
  error: string | null;
  setError: (err: string | null) => void;
  // actions
  addDeck: (title: string, description: string) => string;
  deleteDeck: (deckId: string) => void;
  updateDeck: (
    deckId: string,
    updates: Partial<Pick<Deck, 'title' | 'description'>>
  ) => void;
  addCard: (
    deckId: string,
    front: string,
    back: string,
    tags?: string[]
  ) => string;
  deleteCard: (deckId: string, cardId: string) => void;
  updateCard: (
    deckId: string,
    cardId: string,
    updates: Partial<Pick<Card, 'front' | 'back' | 'tags'>>
  ) => void;
  resetCard: (deckId: string, cardId: string) => void;
  resetDeck: (deckId: string) => void;
  startSession: (deckId: string) => void;
  rateCard: (cardId: string, rating: Rating) => void;
  endSession: () => void;
  getDeckById: (deckId: string) => Deck | null;
  getCardsDueToday: (deckId?: string) => Card[];
  getSessionStats: () =>
    | { correct: number; incorrect: number; accuracy: number; total: number }
    | null;
  getDeckStats: (deckId: string) => { total: number; mastered: number; review: number; learning: number; newCards: number } | null;
}

export const useFlashcardsStore = create<FlashcardsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      error: null,

      setError: (err) => set({ error: err }),

      addDeck: (title, description) => {
        const newDeck: Deck = {
          id: uuidv4(),
          title,
          description,
          createdAt: todayISO(),
          cards: [],
        };
        set((prev) => ({
          decks: [...prev.decks, newDeck],
        }));
        return newDeck.id;
      },

      deleteDeck: (deckId) => {
        set((prev) => ({
          decks: prev.decks.filter((d) => d.id !== deckId),
          activeSession:
            prev.activeSession?.deckId === deckId ? null : prev.activeSession,
        }));
      },

      updateDeck: (deckId, updates) => {
        set((prev) => ({
          decks: prev.decks.map((d) =>
            d.id === deckId ? { ...d, ...updates } : d
          ),
        }));
      },

      addCard: (deckId, front, back, tags = []) => {
        const newCard: Card = {
          id: uuidv4(),
          deckId,
          front,
          back,
          tags: tags || [],
          status: 'new',
          interval: 1,
          easeFactor: 2.5,
          dueDate: todayISO(),
          createdAt: todayISO(),
          lastReviewedAt: null,
        };
        set((prev) => ({
          decks: prev.decks.map((d) =>
            d.id === deckId ? { ...d, cards: [...d.cards, newCard] } : d
          ),
        }));
        return newCard.id;
      },

      deleteCard: (deckId, cardId) => {
        set((prev) => ({
          decks: prev.decks.map((d) =>
            d.id === deckId
              ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
              : d
          ),
        }));
      },

      updateCard: (deckId, cardId, updates) => {
        set((prev) => ({
          decks: prev.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map((c) =>
                    c.id === cardId ? { ...c, ...updates } : c
                  ),
                }
              : d
          ),
        }));
      },

      resetCard: (deckId, cardId) => {
        set((prev) => ({
          decks: prev.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map((c) =>
                    c.id === cardId
                      ? {
                          ...c,
                          status: 'new' as const,
                          interval: 1,
                          easeFactor: 2.5,
                          dueDate: todayISO(),
                          lastReviewedAt: null,
                        }
                      : c
                  ),
                }
              : d
          ),
        }));
      },

      resetDeck: (deckId) => {
        set((prev) => ({
          decks: prev.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map((c) => ({
                    ...c,
                    status: 'new' as const,
                    interval: 1,
                    easeFactor: 2.5,
                    dueDate: todayISO(),
                    lastReviewedAt: null,
                  })),
                }
              : d
          ),
        }));
      },

      startSession: (deckId) => {
        set({
          activeSession: {
            deckId,
            startedAt: todayISO(),
            cardsReviewed: [],
            isComplete: false,
          },
        });
      },

      rateCard: (cardId, rating) => {
        const session = get().activeSession;
        if (!session) return;

        const currentDecks = get().decks;
        const updatedDecks = currentDecks.map((d) =>
          d.id === session.deckId
            ? {
                ...d,
                cards: d.cards.map((c) => {
                  if (c.id !== cardId) return c;

                  const nextReview = computeNextReview(c, rating);
                  return {
                    ...c,
                    status: nextReview.status,
                    interval: nextReview.interval,
                    easeFactor: nextReview.easeFactor,
                    dueDate: nextReview.dueDate,
                    lastReviewedAt: todayISO(),
                  };
                }),
              }
            : d
        );

        const newSession = {
          ...session,
          cardsReviewed: [...session.cardsReviewed, { cardId, rating }],
        };

        set({ decks: updatedDecks, activeSession: newSession });
      },

      endSession: () => {
        set((prev) => ({
          activeSession: prev.activeSession
            ? { ...prev.activeSession, isComplete: true }
            : null,
        }));
      },

      getDeckById: (deckId) => {
        const decks = get().decks;
        return decks.find((d) => d.id === deckId) ?? null;
      },

      getCardsDueToday: (deckId) => {
        const decks = deckId
          ? get().decks.filter((d) => d.id === deckId)
          : get().decks;
        return decks.flatMap((d) => d.cards.filter(isCardDueToday));
      },

      getSessionStats: () => {
        const session = get().activeSession;
        if (!session) return null;
        const { cardsReviewed } = session;
        const correct = cardsReviewed.filter(
          (r) => r.rating === 'good' || r.rating === 'easy'
        ).length;
        const incorrect = cardsReviewed.length - correct;
        const accuracy =
          cardsReviewed.length > 0
            ? Math.round((correct / cardsReviewed.length) * 100)
            : 0;
        return { correct, incorrect, accuracy, total: cardsReviewed.length };
      },

      getDeckStats: (deckId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return null;
        const total = deck.cards.length;
        const mastered = deck.cards.filter((c) => c.status === 'mastered').length;
        const review = deck.cards.filter((c) => c.status === 'review').length;
        const learning = deck.cards.filter((c) => c.status === 'learning').length;
        const newCards = deck.cards.filter((c) => c.status === 'new').length;
        return { total, mastered, review, learning, newCards };
      },
    }),
    {
      name: 'flashflow-storage',
      partialize: (state) => ({
        decks: state.decks,
        // activeSession and error are intentionally excluded (transient, not persisted)
      }),
    }
  )
);
