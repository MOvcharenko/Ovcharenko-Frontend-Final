import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlashcards } from './useFlashcards';
import type { AppState } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function freshHook(initial?: AppState) {
  return renderHook(() => useFlashcards(initial));
}

// ── Deck operations ───────────────────────────────────────────────────────────

describe('useFlashcards — deck operations', () => {
  it('starts with an empty deck list', () => {
    const { result } = freshHook();
    expect(result.current.state.decks).toHaveLength(0);
  });

  it('adds a deck with the correct title and description', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Spanish Vocab', 'Common Spanish words');
    });

    expect(result.current.state.decks).toHaveLength(1);
    expect(result.current.state.decks[0].title).toBe('Spanish Vocab');
    expect(result.current.state.decks[0].description).toBe('Common Spanish words');
    expect(result.current.state.decks[0].cards).toHaveLength(0);
  });

  it('deletes a deck by id', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('To Delete', '');
    });

    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.deleteDeck(deckId);
    });

    expect(result.current.state.decks).toHaveLength(0);
  });

  it('updates a deck title without affecting other decks', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Original Title', 'desc');
      result.current.addDeck('Other Deck', 'desc');
    });

    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.updateDeck(deckId, { title: 'New Title' });
    });

    expect(result.current.state.decks[0].title).toBe('New Title');
    expect(result.current.state.decks[1].title).toBe('Other Deck');
  });
});

// ── Card operations ───────────────────────────────────────────────────────────

describe('useFlashcards — card operations', () => {
  it('adds a card to the correct deck with "new" status', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck A', '');
    });

    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'What is 2+2?', '4');
    });

    const card = result.current.state.decks[0].cards[0];
    expect(card.front).toBe('What is 2+2?');
    expect(card.back).toBe('4');
    expect(card.status).toBe('new');
    expect(card.deckId).toBe(deckId);
  });

  it('deletes a card from a deck', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Q', 'A');
    });
    const cardId = result.current.state.decks[0].cards[0].id;

    act(() => {
      result.current.deleteCard(deckId, cardId);
    });

    expect(result.current.state.decks[0].cards).toHaveLength(0);
  });

  it('updates card front and back', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Old front', 'Old back');
    });
    const cardId = result.current.state.decks[0].cards[0].id;

    act(() => {
      result.current.updateCard(deckId, cardId, { front: 'New front', back: 'New back' });
    });

    const card = result.current.state.decks[0].cards[0];
    expect(card.front).toBe('New front');
    expect(card.back).toBe('New back');
  });

  it('resets a single card back to "new" status with default SRS values', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Q', 'A');
    });
    const cardId = result.current.state.decks[0].cards[0].id;

    // Simulate some review history by rating the card
    act(() => {
      result.current.startSession(deckId);
      result.current.rateCard(cardId, 'easy');
    });

    // Confirm status changed
    expect(result.current.state.decks[0].cards[0].status).toBe('mastered');

    act(() => {
      result.current.resetCard(deckId, cardId);
    });

    const card = result.current.state.decks[0].cards[0];
    expect(card.status).toBe('new');
    expect(card.interval).toBe(1);
    expect(card.easeFactor).toBe(2.5);
    expect(card.lastReviewedAt).toBeNull();
  });

  it('resets all cards in a deck', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Q1', 'A1');
      result.current.addCard(deckId, 'Q2', 'A2');
    });

    act(() => {
      result.current.resetDeck(deckId);
    });

    const cards = result.current.state.decks[0].cards;
    cards.forEach(c => {
      expect(c.status).toBe('new');
      expect(c.interval).toBe(1);
      expect(c.easeFactor).toBe(2.5);
    });
  });
});

// ── Study session ─────────────────────────────────────────────────────────────

describe('useFlashcards — study session', () => {
  it('starts a session for the correct deck', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.startSession(deckId);
    });

    expect(result.current.state.activeSession).not.toBeNull();
    expect(result.current.state.activeSession?.deckId).toBe(deckId);
    expect(result.current.state.activeSession?.isComplete).toBe(false);
  });

  it('records a card rating and updates the card SRS fields', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Q', 'A');
    });
    const cardId = result.current.state.decks[0].cards[0].id;

    act(() => {
      result.current.startSession(deckId);
      result.current.rateCard(cardId, 'good');
    });

    const card = result.current.state.decks[0].cards[0];
    expect(card.status).toBe('review');
    expect(card.lastReviewedAt).not.toBeNull();

    const session = result.current.state.activeSession!;
    expect(session.cardsReviewed).toHaveLength(1);
    expect(session.cardsReviewed[0].rating).toBe('good');
  });

  it('marks session as complete when endSession is called', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.startSession(deckId);
      result.current.endSession();
    });

    expect(result.current.state.activeSession?.isComplete).toBe(true);
  });

  it('computes session stats correctly', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Q1', 'A1');
      result.current.addCard(deckId, 'Q2', 'A2');
      result.current.addCard(deckId, 'Q3', 'A3');
    });

    const cards = result.current.state.decks[0].cards;

    act(() => {
      result.current.startSession(deckId);
      result.current.rateCard(cards[0].id, 'easy');  // correct
      result.current.rateCard(cards[1].id, 'good');  // correct
      result.current.rateCard(cards[2].id, 'again'); // incorrect
    });

    const stats = result.current.getSessionStats();
    expect(stats?.correct).toBe(2);
    expect(stats?.incorrect).toBe(1);
    expect(stats?.accuracy).toBe(67);
    expect(stats?.total).toBe(3);
  });

  it('returns null session stats when no session is active', () => {
    const { result } = freshHook();
    expect(result.current.getSessionStats()).toBeNull();
  });
});

// ── Derived queries ───────────────────────────────────────────────────────────

describe('useFlashcards — derived queries', () => {
  it('getDeckById returns null for an unknown id', () => {
    const { result } = freshHook();
    expect(result.current.getDeckById('nonexistent')).toBeNull();
  });

  it('getDeckStats returns correct counts per status', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Q1', 'A1'); // will stay new
      result.current.addCard(deckId, 'Q2', 'A2'); // will be rated easy → mastered
    });

    const cards = result.current.state.decks[0].cards;

    act(() => {
      result.current.startSession(deckId);
      result.current.rateCard(cards[1].id, 'easy');
    });

    const stats = result.current.getDeckStats(deckId);
    expect(stats?.total).toBe(2);
    expect(stats?.mastered).toBe(1);
    expect(stats?.newCards).toBe(1);
  });

  it('getCardsDueToday returns only cards whose dueDate is now or past', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    // New cards have dueDate = now, so they should be due
    act(() => {
      result.current.addCard(deckId, 'Q1', 'A1');
      result.current.addCard(deckId, 'Q2', 'A2');
    });

    // Rate one card 'easy' so its next review is far in the future
    const cards = result.current.state.decks[0].cards;
    act(() => {
      result.current.startSession(deckId);
      result.current.rateCard(cards[0].id, 'easy');
    });

    const due = result.current.getCardsDueToday();
    // cards[0] is now scheduled days ahead, cards[1] is still due
    expect(due.some(c => c.id === cards[1].id)).toBe(true);
    expect(due.find(c => c.id === cards[0].id)).toBeUndefined();
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('useFlashcards — edge cases', () => {
  it('deleting a deck clears an active session for that deck', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.startSession(deckId);
    });
    expect(result.current.state.activeSession).not.toBeNull();

    act(() => {
      result.current.deleteDeck(deckId);
    });
    expect(result.current.state.activeSession).toBeNull();
  });

  it('rateCard does nothing if no session is active', () => {
    const { result } = freshHook();

    act(() => {
      result.current.addDeck('Deck', '');
    });
    const deckId = result.current.state.decks[0].id;

    act(() => {
      result.current.addCard(deckId, 'Q', 'A');
    });
    const cardId = result.current.state.decks[0].cards[0].id;
    const statusBefore = result.current.state.decks[0].cards[0].status;

    act(() => {
      result.current.rateCard(cardId, 'easy');
    });

    expect(result.current.state.decks[0].cards[0].status).toBe(statusBefore);
  });

  it('getDeckStats returns null for a non-existent deck', () => {
    const { result } = freshHook();
    expect(result.current.getDeckStats('bad-id')).toBeNull();
  });
});