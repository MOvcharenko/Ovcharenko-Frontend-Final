import type { Deck, Card, Rating } from '../types';
import { pb } from '../lib/pocketbase';
import { computeNextReview } from '../utils/srs';

// uniform API response format
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
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

// actual implementation using PocketBase
export const api: ApiService = {
  async fetchDecks() {
    try {
      const decks = await pb.collection('decks').getFullList<Deck>({ sort: '-created' });
      // For each deck, fetch its cards
      const decksWithCards = await Promise.all(
        decks.map(async (deck) => {
          const cards = await pb.collection('cards').getFullList<Card>({
            filter: `deckId = "${deck.id}"`,
            sort: '-created',
          });
          return { ...deck, cards };
        })
      );
      return { data: decksWithCards, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to fetch decks' };
    }
  },
  async createDeck(title, description) {
    try {
      const data = { title, description };
      const record = await pb.collection('decks').create<Deck>(data);
      return { data: { ...record, cards: [] }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create deck' };
    }
  },
  async updateDeck(deckId, data) {
    try {
      const record = await pb.collection('decks').update<Deck>(deckId, data);
      // Need to refetch cards since update might not include them
      const cards = await pb.collection('cards').getFullList<Card>({
        filter: `deckId = "${deckId}"`,
        sort: '-created',
      });
      return { data: { ...record, cards }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to update deck' };
    }
  },
  async deleteDeck(deckId) {
    try {
      await pb.collection('decks').delete(deckId);
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to delete deck' };
    }
  },
  async createCard(deckId, front, back, tags = []) {
    try {
      const data = { deckId, front, back, tags, status: 'new', interval: 1, easeFactor: 2.5, dueDate: new Date().toISOString(), createdAt: new Date().toISOString(), lastReviewedAt: null };
      const record = await pb.collection('cards').create<Card>(data);
      return { data: record, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create card' };
    }
  },
  async updateCard(cardId, data) {
    try {
      const record = await pb.collection('cards').update<Card>(cardId, data);
      return { data: record, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to update card' };
    }
  },
  async deleteCard(cardId) {
    try {
      await pb.collection('cards').delete(cardId);
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to delete card' };
    }
  },
  async rateCard(cardId, rating) {
    try {
      // First, get the current card
      const currentCard = await pb.collection('cards').getOne<Card>(cardId);
      // Compute next review
      const srUpdates = computeNextReview(currentCard, rating);
      const updates = {
        ...srUpdates,
        lastReviewedAt: new Date().toISOString(),
      };
      // Update the card
      const record = await pb.collection('cards').update<Card>(cardId, updates);
      return { data: record, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to rate card' };
    }
  },
  async resetCard(cardId) {
    try {
      const data = { status: 'new', interval: 1, easeFactor: 2.5, dueDate: new Date().toISOString(), lastReviewedAt: null };
      const record = await pb.collection('cards').update<Card>(cardId, data);
      return { data: record, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to reset card' };
    }
  },
};
