import type { Deck, Card, Rating } from '../types';

// define planned backend operations
export interface ApiService {
  fetchDecks(): Promise<Deck[]>;
  createDeck(title: string, description: string): Promise<Deck>;
  updateDeck(deckId: string, data: Partial<Pick<Deck, 'title' | 'description'>>): Promise<Deck>;
  deleteDeck(deckId: string): Promise<void>;

  createCard(deckId: string, front: string, back: string, tags?: string[]): Promise<Card>;
  updateCard(cardId: string, data: Partial<Pick<Card, 'front' | 'back' | 'tags'>>): Promise<Card>;
  deleteCard(cardId: string): Promise<void>;

  rateCard(cardId: string, rating: Rating): Promise<void>;
  // additional operations can be added as needed
}

// placeholder implementation using plain fetch style (but just mocks)
export const api: ApiService = {
  async fetchDecks() {
    // would call `fetch('/api/decks')` in real app
    return [];
  },
  async createDeck(title, description) {
    return { id: crypto.randomUUID(), title, description, createdAt: new Date().toISOString(), cards: [] };
  },
  async updateDeck(deckId, data) {
    return { id: deckId, title: data.title || '', description: data.description || '', createdAt: new Date().toISOString(), cards: [] };
  },
  async deleteDeck(_deckId) {
    return;
  },
  async createCard(deckId, front, back, tags = []) {
    return { id: crypto.randomUUID(), deckId, front, back, tags, status: 'new', interval: 1, easeFactor: 2.5, dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), lastReviewedAt: null };
  },
  async updateCard(cardId, data) {
    return { id: cardId, deckId: '', front: data.front || '', back: data.back || '', tags: data.tags || [], status: 'new', interval: 1, easeFactor: 2.5, dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), lastReviewedAt: null };
  },
  async deleteCard(_cardId) {
    return;
  },
  async rateCard(_cardId, _rating) {
    return;
  },
};
