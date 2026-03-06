import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppState,
  Card,
  Deck,
  Rating,
} from '../types';
import { computeNextReview, isCardDueToday } from '../utils/srs';
import { api } from '../services/api';

// helpers copied from hook
function todayISO(): string {
  return new Date().toISOString();
}

function makeCard(deckId: string, front: string, back: string, tags: string[] = []): Card {
  return {
    id: uuidv4(),
    deckId,
    front,
    back,
    tags,
    status: 'new',
    interval: 1,
    easeFactor: 2.5,
    dueDate: todayISO(),
    createdAt: todayISO(),
    lastReviewedAt: null,
  };
}

export const DEFAULT_STATE: AppState = {
  decks: [],
  activeSession: null,
};

export interface FlashcardsStore extends AppState {
  loading: boolean;
  error: string | null;
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
  getDeckStats: (
    deckId: string
  ) =>
    | { total: number; mastered: number; learning: number; newCards: number }
    | null;
}

export const useFlashcardsStore = create<FlashcardsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      loading: false,
      error: null,

      addDeck: (title, description) => {
    const id = uuidv4();
    const newDeck: Deck = {
      id,
      title,
      description,
      createdAt: todayISO(),
      cards: [],
    };
    // call API (placeholder) - fire and forget
    api.createDeck(title, description).catch(() => {
      /* ignore errors in mock */
    });
    set((prev) => ({ ...prev, decks: [...prev.decks, newDeck] }));
    return id;
  },

  deleteDeck: (deckId) => {
      api.deleteDeck(deckId).catch(() => {
        /* ignore errors in mock */
      });
      set((prev) => ({
        ...prev,
        decks: prev.decks.filter((d) => d.id !== deckId),
        activeSession:
          prev.activeSession?.deckId === deckId ? null : prev.activeSession,
      }));
    },
  updateDeck: (deckId, updates) => {
    set((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId ? { ...d, ...updates } : d
      ),
    }));
  },

  addCard: (deckId, front, back, tags = []) => {
    const card = makeCard(deckId, front, back, tags);
    set((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId ? { ...d, cards: [...d.cards, card] } : d
      ),
    }));
    return card.id;
  },

  deleteCard: (deckId, cardId) => {
    set((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
          : d
      ),
    }));
  },

  updateCard: (deckId, cardId, updates) => {
    set((prev) => ({
      ...prev,
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
      ...prev,
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
      ...prev,
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
    set((prev) => ({
      ...prev,
      activeSession: {
        deckId,
        startedAt: todayISO(),
        cardsReviewed: [],
        isComplete: false,
      },
    }));
  },

  rateCard: (cardId, rating) => {
    set((prev) => {
      const session = prev.activeSession;
      if (!session) return prev;
      const deck = prev.decks.find((d) => d.id === session.deckId);
      const card = deck?.cards.find((c) => c.id === cardId);
      if (!card || !deck) return prev;

      const updates = computeNextReview(card, rating);

      const updatedDecks = prev.decks.map((d) =>
        d.id === deck.id
          ? {
              ...d,
              cards: d.cards.map((c) =>
                c.id === cardId
                  ? { ...c, ...updates, lastReviewedAt: todayISO() }
                  : c
              ),
            }
          : d
      );

      const updatedSession = {
        ...session,
        cardsReviewed: [
          ...session.cardsReviewed,
          { cardId, rating },
        ],
      };

      return { ...prev, decks: updatedDecks, activeSession: updatedSession };
    });
  },

  endSession: () => {
    set((prev) => ({
      ...prev,
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
    const learning = deck.cards.filter((c) => c.status === 'learning').length;
    const newCards = deck.cards.filter((c) => c.status === 'new').length;
    return { total, mastered, learning, newCards };
  },
}),
  {
    name: 'flashflow-storage',
    partialize: (state) => ({
      decks: state.decks,
      activeSession: state.activeSession,
    }),
  }
));
