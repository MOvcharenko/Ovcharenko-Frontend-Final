import { create } from 'zustand';
import type {
  AppState,
  Card,
  Deck,
  Rating,
} from '../types';
import { isCardDueToday } from '../utils/srs';
import { api } from '../services/api';

// helpers copied from hook
function todayISO(): string {
  return new Date().toISOString();
}


export const DEFAULT_STATE: AppState = {
  decks: [],
  activeSession: null,
};

export interface FlashcardsStore extends AppState {
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  // actions
  addDeck: (title: string, description: string) => Promise<string>;
  deleteDeck: (deckId: string) => Promise<void>;
  updateDeck: (
    deckId: string,
    updates: Partial<Pick<Deck, 'title' | 'description'>>
  ) => Promise<void>;
  addCard: (
    deckId: string,
    front: string,
    back: string,
    tags?: string[]
  ) => Promise<string>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  updateCard: (
    deckId: string,
    cardId: string,
    updates: Partial<Pick<Card, 'front' | 'back' | 'tags'>>
  ) => Promise<void>;
  resetCard: (deckId: string, cardId: string) => Promise<void>;
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
  loadDecks: () => Promise<void>;
}

export const useFlashcardsStore = create<FlashcardsStore>()((set, get) => ({
  ...DEFAULT_STATE,
  loading: false,
  error: null,

  loadDecks: async () => {
    set({ loading: true, error: null });
    const response = await api.fetchDecks();
    if (response.error || !response.data) {
      set({ loading: false, error: response.error || 'Unknown error' });
      return;
    }
    set({ decks: response.data, loading: false });
  },

  setError: (err) => set({ error: err }),
      addDeck: async (title, description) => {
    set({ loading: true, error: null });
    const response = await api.createDeck(title, description);
    if (response.error || !response.data) {
      set({ loading: false, error: response.error || 'Unknown error' });
      // return a dummy id so callers don't break, though they should check error
      return '';
    }
    const newDeck = response.data;
    set((prev) => ({
      ...prev,
      decks: [...prev.decks, newDeck],
      loading: false,
    }));
    return newDeck.id;
  },

  deleteDeck: async (deckId) => {
      set({ loading: true, error: null });
      const response = await api.deleteDeck(deckId);
      if (response.error) {
        set({ loading: false, error: response.error });
        return;
      }
      set((prev) => ({
        ...prev,
        decks: prev.decks.filter((d) => d.id !== deckId),
        activeSession:
          prev.activeSession?.deckId === deckId ? null : prev.activeSession,
        loading: false,
      }));
    },
  updateDeck: async (deckId, updates) => {
    set({ loading: true, error: null });
    const response = await api.updateDeck(deckId, updates);
    if (response.error || !response.data) {
      set({ loading: false, error: response.error || 'Unknown error' });
      return;
    }
    const updated = response.data;
    set((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => (d.id === deckId ? updated : d)),
      loading: false,
    }));
  },

  addCard: async (deckId, front, back, tags = []) => {
    set({ loading: true, error: null });
    const response = await api.createCard(deckId, front, back, tags);
    if (response.error || !response.data) {
      set({ loading: false, error: response.error || 'Unknown error' });
      return '';
    }
    const card = response.data;
    set((prev) => {
      const updated = {
        ...prev,
        decks: prev.decks.map((d) =>
          d.id === deckId ? { ...d, cards: [...d.cards, card] } : d
        ),
        loading: false,
      };
      return updated;
    });
    return card.id;
  },

  deleteCard: async (deckId, cardId) => {
    set({ loading: true, error: null });
    const response = await api.deleteCard(cardId);
    if (response.error) {
      set({ loading: false, error: response.error });
      return;
    }
    set((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
          : d
      ),
      loading: false,
    }));
  },

  updateCard: async (deckId, cardId, updates) => {
    set({ loading: true, error: null });
    const response = await api.updateCard(cardId, updates);
    if (response.error || !response.data) {
      set({ loading: false, error: response.error || 'Unknown error' });
      return;
    }
    const updated = response.data;
    set((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) =>
                c.id === cardId ? updated : c
              ),
            }
          : d
      ),
      loading: false,
    }));
  },

  resetCard: async (deckId, cardId) => {
    set({ loading: true, error: null });
    const response = await api.resetCard(cardId);
    if (response.error || !response.data) {
      set({ loading: false, error: response.error || 'Unknown error' });
      return;
    }
    const updated = response.data;
    set((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) => (c.id === cardId ? updated : c)),
            }
          : d
      ),
      loading: false,
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

  rateCard: async (cardId, rating) => {
    const session = get().activeSession;
    if (!session) {
      // do not contact server or update state when no session active
      return;
    }
    set({ loading: true, error: null });
    const response = await api.rateCard(cardId, rating);
    if (response.error || !response.data) {
      set({ loading: false, error: response.error || 'Unknown error' });
      return;
    }
    const updatedCard = response.data;
    set((prev) => {
      const newSession = {
        ...session,
        cardsReviewed: [...session.cardsReviewed, { cardId, rating }],
      };
      const updatedDecks = prev.decks.map((d) =>
        d.id === updatedCard.deckId
          ? {
              ...d,
              cards: d.cards.map((c) =>
                c.id === cardId ? updatedCard : c
              ),
            }
          : d
      );
      return { ...prev, decks: updatedDecks, activeSession: newSession, loading: false };
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
}));
