import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Deck, Card, Rating, StudySession, AppState } from '../src/types';
import { readDb, writeDb } from './storage';
import { computeNextReview } from '../src/utils/srs';

const router = Router();

function apiResponse<T>(res: Response, data: T | null, error: string | null, status = 200) {
  if (error) {
    return res.status(status).json({ data: null, error });
  }
  return res.status(status).json({ data, error: null });
}

// helpers to find deck/card
function findDeck(state: AppState, deckId: string): Deck | undefined {
  return state.decks.find((d) => d.id === deckId);
}

function findCard(state: AppState, cardId: string): { card: Card; deck: Deck } | undefined {
  for (const deck of state.decks) {
    const card = deck.cards.find((c) => c.id === cardId);
    if (card) return { card, deck };
  }
  return undefined;
}

// Deck routes
router.get('/decks', (req, res) => {
  const state = readDb();
  apiResponse(res, state.decks, null);
});

router.get('/decks/:deckId', (req, res) => {
  const state = readDb();
  const deck = findDeck(state, req.params.deckId);
  if (!deck) return apiResponse(res, null, 'Deck not found', 404);
  apiResponse(res, deck, null);
});

router.post('/decks', (req, res) => {
  const { title, description } = req.body;
  if (!title || typeof title !== 'string') {
    return apiResponse(res, null, 'Title is required', 400);
  }
  const state = readDb();
  const newDeck: Deck = {
    id: uuidv4(),
    title,
    description: description || '',
    createdAt: new Date().toISOString(),
    cards: [],
  };
  state.decks.push(newDeck);
  writeDb(state);
  apiResponse(res, newDeck, null, 201);
});

router.patch('/decks/:deckId', (req, res) => {
  const { title, description } = req.body;
  const state = readDb();
  const deck = findDeck(state, req.params.deckId);
  if (!deck) return apiResponse(res, null, 'Deck not found', 404);
  if (title && typeof title === 'string') deck.title = title;
  if (description && typeof description === 'string') deck.description = description;
  writeDb(state);
  apiResponse(res, deck, null);
});

router.delete('/decks/:deckId', (req, res) => {
  const state = readDb();
  const originalLength = state.decks.length;
  state.decks = state.decks.filter((d) => d.id !== req.params.deckId);
  if (state.decks.length === originalLength) {
    return apiResponse(res, null, 'Deck not found', 404);
  }
  // also clear activeSession if it was for this deck
  if (state.activeSession?.deckId === req.params.deckId) {
    state.activeSession = null;
  }
  writeDb(state);
  // successful deletion returns 204 with empty body
  return res.status(204).send();
});

// Card routes
router.get('/decks/:deckId/cards', (req, res) => {
  const state = readDb();
  const deck = findDeck(state, req.params.deckId);
  if (!deck) return apiResponse(res, null, 'Deck not found', 404);
  apiResponse(res, deck.cards, null);
});

router.post('/decks/:deckId/cards', (req, res) => {
  const { front, back, tags } = req.body;
  if (!front || !back) {
    return apiResponse(res, null, 'Front and back text are required', 400);
  }
  const state = readDb();
  const deck = findDeck(state, req.params.deckId);
  if (!deck) return apiResponse(res, null, 'Deck not found', 404);
  const newCard: Card = {
    id: uuidv4(),
    deckId: deck.id,
    front,
    back,
    tags: Array.isArray(tags) ? tags : [],
    status: 'new',
    interval: 1,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lastReviewedAt: null,
  };
  deck.cards.push(newCard);
  writeDb(state);
  apiResponse(res, newCard, null, 201);
});

router.patch('/cards/:cardId', (req, res) => {
  const { front, back, tags } = req.body;
  const state = readDb();
  const found = findCard(state, req.params.cardId);
  if (!found) return apiResponse(res, null, 'Card not found', 404);
  const { card } = found;
  if (front && typeof front === 'string') card.front = front;
  if (back && typeof back === 'string') card.back = back;
  if (Array.isArray(tags)) card.tags = tags;
  writeDb(state);
  apiResponse(res, card, null);
});

router.delete('/cards/:cardId', (req, res) => {
  const state = readDb();
  let removed = false;
  state.decks.forEach((d) => {
    const orig = d.cards.length;
    d.cards = d.cards.filter((c) => c.id !== req.params.cardId);
    if (d.cards.length !== orig) removed = true;
  });
  if (!removed) return apiResponse(res, null, 'Card not found', 404);
  writeDb(state);
  return res.status(204).send();
});

router.post('/cards/:cardId/reset', (req, res) => {
  const state = readDb();
  const found = findCard(state, req.params.cardId);
  if (!found) return apiResponse(res, null, 'Card not found', 404);
  const { card } = found;
  card.status = 'new';
  card.interval = 1;
  card.easeFactor = 2.5;
  card.dueDate = new Date().toISOString();
  card.lastReviewedAt = null;
  writeDb(state);
  apiResponse(res, card, null);
});

router.post('/cards/:cardId/rate', (req, res) => {
  const { rating } = req.body;
  if (!rating) return apiResponse(res, null, 'Rating required', 400);
  const state = readDb();
  const found = findCard(state, req.params.cardId);
  if (!found) return apiResponse(res, null, 'Card not found', 404);
  const { card } = found;
  const updates = computeNextReview(card, rating as Rating);
  card.interval = updates.interval;
  card.easeFactor = updates.easeFactor;
  card.dueDate = updates.dueDate;
  card.status = updates.status;
  card.lastReviewedAt = new Date().toISOString();
  writeDb(state);
  apiResponse(res, card, null);
});

export default router;
