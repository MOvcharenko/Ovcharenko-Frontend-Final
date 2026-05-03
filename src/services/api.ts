import type { Deck, Card, Rating } from '../types';
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
    if (res.status === 204) {
      return { data: null, error: null };
    }
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: message || 'Network error' };
  }
}

const BASE = API_CONFIG.baseUrl;

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
export const api: ApiService = {
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
