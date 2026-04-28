import type { AppState, Deck, Card, Rating } from '../types';
import { computeNextReview } from '../utils/srs';
import type { ApiService, ApiResponse } from '../services/api';

// simple in-memory copy of state to mimic backend
// module-scoped so it can be reset between tests
let stubMemory: AppState = { decks: [], activeSession: null };
// counter used for generating deterministic unique ids in tests
let stubIdCounter = 1;
function generateStubId() {
  return `stub-${stubIdCounter++}`;
}

function stubService(): ApiService {
  const wrap = <T>(data: T | null, error: string | null = null) =>
    Promise.resolve({ data, error });

  const findDeck = (deckId: string) =>
    stubMemory.decks.find((d: Deck) => d.id === deckId);
  const findCard = (cardId: string) => {
    for (const deck of stubMemory.decks) {
      const card = deck.cards.find((c: Card) => c.id === cardId);
      if (card) return { card, deck };
    }
    return null;
  };

  return {
    async fetchDecks() {
      // return deep copies so callers can't mutate stubMemory directly
      return wrap(
        stubMemory.decks.map((d: Deck) => ({
          ...d,
          cards: d.cards.map((c: Card) => ({ ...c })),
        }))
      );
    },

    async createDeck(title, description) {
      const deck: Deck = {
        id: generateStubId(),
        title,
        description,
        createdAt: new Date().toISOString(),
        cards: [],
      };
      stubMemory.decks.push(deck);
      return wrap(deck);
    },

    async updateDeck(deckId, data) {
      const deck = findDeck(deckId);
      if (!deck) return wrap(null, 'Deck not found');
      Object.assign(deck, data);
      return wrap(deck);
    },

    async deleteDeck(deckId) {
      const index = stubMemory.decks.findIndex((d: Deck) => d.id === deckId);
      if (index === -1) return wrap(null, 'Deck not found');
      stubMemory.decks.splice(index, 1);
      return wrap(null);
    },

    async createCard(deckId, front, back, tags = []) {
      const deck = findDeck(deckId);
      if (!deck) return wrap(null, 'Deck not found');
      const card: Card = {
        id: generateStubId(),
        deckId,
        front,
        back,
        tags,
        status: 'new',
        interval: 1,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastReviewedAt: null,
      };
      deck.cards.push(card);
      return wrap(card);
    },

    async updateCard(cardId, data) {
      const found = findCard(cardId);
      if (!found) return wrap(null, 'Card not found');
      const { card } = found;
      Object.assign(card, data);
      return wrap(card);
    },

    async deleteCard(cardId) {
      const found = findCard(cardId);
      if (!found) return wrap(null, 'Card not found');
      const { card, deck } = found;
      deck.cards = deck.cards.filter((c) => c.id !== cardId);
      return wrap(null);
    },

    async rateCard(cardId, rating) {
      const found = findCard(cardId);
      if (!found) return wrap(null, 'Card not found');
      const { card, deck } = found;
      const updates = computeNextReview(card, rating);
      const updatedCard: Card = {
        ...card,
        ...updates,
        lastReviewedAt: new Date().toISOString(),
      };
      // persist immutably
      deck.cards = deck.cards.map((c) => (c.id === cardId ? updatedCard : c));
      return wrap(updatedCard);
    },

    async resetCard(cardId) {
      const found = findCard(cardId);
      if (!found) return wrap(null, 'Card not found');
      const { card, deck } = found;
      const reset: Card = {
        ...card,
        status: 'new',
        interval: 1,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        lastReviewedAt: null,
      };
      deck.cards = deck.cards.map((c) => (c.id === cardId ? reset : c));
      return wrap(reset);
    },
  };
}

// testing helper to clear in-memory state between tests
export function resetApiStub() {
  stubMemory = { decks: [], activeSession: null };
  stubIdCounter = 1;
}

export function createTestApi(): ApiService {
  return stubService();
}