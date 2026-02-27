import { useState, useCallback, useEffect } from 'react';
import type { AppState, Card, Deck, Rating } from '../types';
import { computeNextReview, isCardDueToday } from '../utils/srs';
import { loadState, saveState } from '../utils/storage';

const INITIAL_EASE = 2.5;
const INITIAL_INTERVAL = 1;

const DEFAULT_STATE: AppState = {
  decks: [],
  activeSession: null,
};

function todayISO(): string {
  return new Date().toISOString();
}

function makeCard(deckId: string, front: string, back: string, tags: string[] = []): Card {
  return {
    id: crypto.randomUUID(),
    deckId,
    front,
    back,
    tags,
    status: 'new',
    interval: INITIAL_INTERVAL,
    easeFactor: INITIAL_EASE,
    dueDate: todayISO(),
    createdAt: todayISO(),
    lastReviewedAt: null,
  };
}

export function useFlashcards(initialState?: AppState) {
  // Load from localStorage on first render, fall back to passed-in state or default
  const [state, setState] = useState<AppState>(
    () => initialState ?? loadState() ?? DEFAULT_STATE
  );

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Deck operations ──────────────────────────────────────────────────────

  const addDeck = useCallback((title: string, description: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: todayISO(),
      cards: [],
    };
    setState(prev => ({ ...prev, decks: [...prev.decks, newDeck] }));
    return newDeck.id;
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setState(prev => ({
      ...prev,
      decks: prev.decks.filter(d => d.id !== deckId),
      activeSession:
        prev.activeSession?.deckId === deckId ? null : prev.activeSession,
    }));
  }, []);

  const updateDeck = useCallback(
    (deckId: string, updates: Partial<Pick<Deck, 'title' | 'description'>>) => {
      setState(prev => ({
        ...prev,
        decks: prev.decks.map(d =>
          d.id === deckId ? { ...d, ...updates } : d
        ),
      }));
    },
    []
  );

  // ── Card operations ──────────────────────────────────────────────────────

  const addCard = useCallback(
    (deckId: string, front: string, back: string, tags: string[] = []) => {
      const card = makeCard(deckId, front, back, tags);
      setState(prev => ({
        ...prev,
        decks: prev.decks.map(d =>
          d.id === deckId ? { ...d, cards: [...d.cards, card] } : d
        ),
      }));
      return card.id;
    },
    []
  );

  const deleteCard = useCallback((deckId: string, cardId: string) => {
    setState(prev => ({
      ...prev,
      decks: prev.decks.map(d =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter(c => c.id !== cardId) }
          : d
      ),
    }));
  }, []);

  const updateCard = useCallback(
    (
      deckId: string,
      cardId: string,
      updates: Partial<Pick<Card, 'front' | 'back' | 'tags'>>
    ) => {
      setState(prev => ({
        ...prev,
        decks: prev.decks.map(d =>
          d.id === deckId
            ? {
                ...d,
                cards: d.cards.map(c =>
                  c.id === cardId ? { ...c, ...updates } : c
                ),
              }
            : d
        ),
      }));
    },
    []
  );

  const resetCard = useCallback((deckId: string, cardId: string) => {
    setState(prev => ({
      ...prev,
      decks: prev.decks.map(d =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map(c =>
                c.id === cardId
                  ? {
                      ...c,
                      status: 'new' as const,
                      interval: INITIAL_INTERVAL,
                      easeFactor: INITIAL_EASE,
                      dueDate: todayISO(),
                      lastReviewedAt: null,
                    }
                  : c
              ),
            }
          : d
      ),
    }));
  }, []);

  const resetDeck = useCallback((deckId: string) => {
    setState(prev => ({
      ...prev,
      decks: prev.decks.map(d =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map(c => ({
                ...c,
                status: 'new' as const,
                interval: INITIAL_INTERVAL,
                easeFactor: INITIAL_EASE,
                dueDate: todayISO(),
                lastReviewedAt: null,
              })),
            }
          : d
      ),
    }));
  }, []);

  // ── Study session operations ─────────────────────────────────────────────

  const startSession = useCallback((deckId: string) => {
    setState(prev => ({
      ...prev,
      activeSession: {
        deckId,
        startedAt: todayISO(),
        cardsReviewed: [],
        isComplete: false,
      },
    }));
  }, []);

  const rateCard = useCallback((cardId: string, rating: Rating) => {
    setState(prev => {
      if (!prev.activeSession) return prev;

      const deck = prev.decks.find(d => d.id === prev.activeSession!.deckId);
      const card = deck?.cards.find(c => c.id === cardId);
      if (!card || !deck) return prev;

      const updates = computeNextReview(card, rating);

      const updatedDecks = prev.decks.map(d =>
        d.id === deck.id
          ? {
              ...d,
              cards: d.cards.map(c =>
                c.id === cardId
                  ? { ...c, ...updates, lastReviewedAt: todayISO() }
                  : c
              ),
            }
          : d
      );

      const updatedSession = {
        ...prev.activeSession,
        cardsReviewed: [
          ...prev.activeSession.cardsReviewed,
          { cardId, rating },
        ],
      };

      return { ...prev, decks: updatedDecks, activeSession: updatedSession };
    });
  }, []);

  const endSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeSession: prev.activeSession
        ? { ...prev.activeSession, isComplete: true }
        : null,
    }));
  }, []);

  // ── Derived / query helpers ──────────────────────────────────────────────

  const getDeckById = useCallback(
    (deckId: string) => state.decks.find(d => d.id === deckId) ?? null,
    [state.decks]
  );

  const getCardsDueToday = useCallback(
    (deckId?: string) => {
      const decks = deckId
        ? state.decks.filter(d => d.id === deckId)
        : state.decks;
      return decks.flatMap(d => d.cards.filter(isCardDueToday));
    },
    [state.decks]
  );

  const getSessionStats = useCallback(() => {
    if (!state.activeSession) return null;
    const { cardsReviewed } = state.activeSession;
    const correct = cardsReviewed.filter(
      r => r.rating === 'good' || r.rating === 'easy'
    ).length;
    const incorrect = cardsReviewed.length - correct;
    const accuracy =
      cardsReviewed.length > 0
        ? Math.round((correct / cardsReviewed.length) * 100)
        : 0;
    return { correct, incorrect, accuracy, total: cardsReviewed.length };
  }, [state.activeSession]);

  const getDeckStats = useCallback(
    (deckId: string) => {
      const deck = state.decks.find(d => d.id === deckId);
      if (!deck) return null;
      const total = deck.cards.length;
      const mastered = deck.cards.filter(c => c.status === 'mastered').length;
      const learning = deck.cards.filter(c => c.status === 'learning').length;
      const newCards = deck.cards.filter(c => c.status === 'new').length;
      return { total, mastered, learning, newCards };
    },
    [state.decks]
  );

  return {
    state,
    // Deck
    addDeck,
    deleteDeck,
    updateDeck,
    // Card
    addCard,
    deleteCard,
    updateCard,
    resetCard,
    resetDeck,
    // Session
    startSession,
    rateCard,
    endSession,
    // Queries
    getDeckById,
    getCardsDueToday,
    getSessionStats,
    getDeckStats,
  };
}