import type { Deck, Card, Rating, AppState } from '../types';
import { API_CONFIG } from './api-config';

// uniform API response format
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// underlying request helper
async function request<T>(
  url: string,
  opts: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      // try to parse error message from body
      const body = await res.json().catch(() => null);
      const message = body && body.error ? body.error : res.statusText;
      return { data: null, error: message };
    }
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}

const BASE = API_CONFIG.baseUrl;

// avoid errors when `process` is undefined (browser environment)
const isTest =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

// fallback implementations used during testing when server may not be running
import { computeNextReview } from '../utils/srs';

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
      // return a copy so caller doesn't share reference with stubMemory
      return wrap({ ...deck, cards: [...deck.cards] });
    },

    async updateDeck(deckId, data) {
      const deck = findDeck(deckId);
      if (!deck) return wrap(null, 'Deck not found');
      if (data.title) deck.title = data.title;
      if (data.description) deck.description = data.description;
      // return a copy
      return wrap({ ...deck, cards: deck.cards.map((c) => ({ ...c })) });
    },
    async deleteDeck(deckId) {
      const len = stubMemory.decks.length;
      stubMemory.decks = stubMemory.decks.filter((d: Deck) => d.id !== deckId);
      if (stubMemory.decks.length === len) return wrap(null, 'Deck not found');
      if (stubMemory.activeSession?.deckId === deckId) stubMemory.activeSession = null;
      return wrap<null>(null);
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
      // return a copy so caller stores its own instance
      return wrap({ ...card });
    },

    async updateCard(cardId, data) {
      const found = findCard(cardId);
      if (!found) return wrap(null, 'Card not found');
      // create a new card object instead of mutating the existing one
      const { card, deck } = found;
      const updatedCard: Card = {
        ...card,
        front: data.front ?? card.front,
        back: data.back ?? card.back,
        tags: Array.isArray(data.tags) ? data.tags : card.tags,
      };
      // persist change
      deck.cards = deck.cards.map((c) => (c.id === cardId ? updatedCard : c));
      return wrap(updatedCard);
    },
    async deleteCard(cardId) {
      let removed = false;
      stubMemory.decks.forEach((d: Deck) => {
        const orig = d.cards.length;
        d.cards = d.cards.filter((c: Card) => c.id !== cardId);
        if (d.cards.length !== orig) removed = true;
      });
      if (!removed) return wrap<null>(null, 'Card not found');
      return wrap<null>(null);
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

// define planned backend operations
export interface ApiService {
  fetchDecks(): Promise<ApiResponse<Deck[]>>;
  createDeck(
    title: string,
    description: string
  ): Promise<ApiResponse<Deck>>;
  updateDeck(
    deckId: string,
    data: Partial<Pick<Deck, 'title' | 'description'>>
  ): Promise<ApiResponse<Deck>>;
  deleteDeck(deckId: string): Promise<ApiResponse<null>>;

  createCard(
    deckId: string,
    front: string,
    back: string,
    tags?: string[]
  ): Promise<ApiResponse<Card>>;
  updateCard(
    cardId: string,
    data: Partial<Pick<Card, 'front' | 'back' | 'tags'>>
  ): Promise<ApiResponse<Card>>;
  deleteCard(cardId: string): Promise<ApiResponse<null>>;

  rateCard(cardId: string, rating: Rating): Promise<ApiResponse<Card>>;
  resetCard(cardId: string): Promise<ApiResponse<Card>>;
  // additional operations can be added as needed
}

// actual implementation using fetch
export const api: ApiService = isTest
  ? (stubService() as any)
  : {
      async fetchDecks() {
        return request<Deck[]>(`${BASE}/decks`);
      },
      async createDeck(title, description) {
        return request<Deck>(`${BASE}/decks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
      },
      async updateDeck(deckId, data) {
        return request<Deck>(`${BASE}/decks/${deckId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      },
      async deleteDeck(deckId) {
        return request<null>(`${BASE}/decks/${deckId}`, {
          method: 'DELETE',
        });
      },
      async createCard(deckId, front, back, tags = []) {
        return request<Card>(`${BASE}/decks/${deckId}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ front, back, tags }),
        });
      },
      async updateCard(cardId, data) {
        return request<Card>(`${BASE}/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      },
      async deleteCard(cardId) {
        return request<null>(`${BASE}/cards/${cardId}`, {
          method: 'DELETE',
        });
      },
      async rateCard(cardId, rating) {
        return request<Card>(`${BASE}/cards/${cardId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating }),
        });
      },
      async resetCard(cardId) {
        return request<Card>(`${BASE}/cards/${cardId}/reset`, {
          method: 'POST',
        });
      },
    };
