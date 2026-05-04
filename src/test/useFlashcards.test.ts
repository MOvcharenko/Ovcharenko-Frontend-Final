import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlashcards } from '../hooks/useFlashcards';
import { useFlashcardsStore, DEFAULT_STATE } from '../store/flashcardsStore';

beforeEach(() => {
  useFlashcardsStore.setState(DEFAULT_STATE);
  localStorage.clear();
});

describe('useFlashcards — deck operations', () => {
  it('starts with an empty deck list', () => {
    const { result } = renderHook(() => useFlashcards());
    expect(result.current.state.decks).toHaveLength(0);
  });

  it('adds a deck with the correct title and description', () => {
    const { result } = renderHook(() => useFlashcards());

    act(() => {
      result.current.addDeck('Spanish Vocab', 'Common Spanish words');
    });

    expect(result.current.state.decks).toHaveLength(1);
    expect(result.current.state.decks[0].title).toBe('Spanish Vocab');
    expect(result.current.state.decks[0].description).toBe('Common Spanish words');
  });

  it('deletes a deck', () => {
    const { result } = renderHook(() => useFlashcards());

    let deckId = '';
    act(() => {
      deckId = result.current.addDeck('Deck to Delete', '');
    });

    expect(result.current.state.decks).toHaveLength(1);

    act(() => {
      result.current.deleteDeck(deckId);
    });

    expect(result.current.state.decks).toHaveLength(0);
  });
});

describe('useFlashcards — card operations', () => {
  it('adds a card to a deck', () => {
    const { result } = renderHook(() => useFlashcards());

    let deckId = '';
    act(() => {
      deckId = result.current.addDeck('Math', 'Basic Math');
    });

    act(() => {
      result.current.addCard(deckId, 'What is 2+2?', '4');
    });

    const deck = result.current.state.decks[0];
    expect(deck.cards).toHaveLength(1);
    expect(deck.cards[0].front).toBe('What is 2+2?');
    expect(deck.cards[0].back).toBe('4');
    expect(deck.cards[0].status).toBe('new');
  });

  it('deletes a card from a deck', () => {
    const { result } = renderHook(() => useFlashcards());

    let deckId = '';
    let cardId = '';
    act(() => {
      deckId = result.current.addDeck('Deck', '');
      cardId = result.current.addCard(deckId, 'Q', 'A');
    });

    expect(result.current.state.decks[0].cards).toHaveLength(1);

    act(() => {
      result.current.deleteCard(deckId, cardId);
    });

    expect(result.current.state.decks[0].cards).toHaveLength(0);
  });
});

describe('useFlashcards — study sessions', () => {
  it('starts a session for a deck', () => {
    const { result } = renderHook(() => useFlashcards());

    let deckId = '';
    act(() => {
      deckId = result.current.addDeck('Deck', '');
      result.current.addCard(deckId, 'Q', 'A');
    });

    expect(result.current.state.activeSession).toBeNull();

    act(() => {
      result.current.startSession(deckId);
    });

    expect(result.current.state.activeSession).not.toBeNull();
    expect(result.current.state.activeSession?.deckId).toBe(deckId);
  });

  it('ends a session', () => {
    const { result } = renderHook(() => useFlashcards());

    let deckId = '';
    act(() => {
      deckId = result.current.addDeck('Deck', '');
      result.current.addCard(deckId, 'Q', 'A');
      result.current.startSession(deckId);
    });

    expect(result.current.state.activeSession).not.toBeNull();

    act(() => {
      result.current.endSession();
    });

    expect(result.current.state.activeSession?.isComplete).toBe(true);
  });

  it('rates a card during a session', () => {
    const { result } = renderHook(() => useFlashcards());

    let deckId = '';
    let cardId = '';
    act(() => {
      deckId = result.current.addDeck('Deck', '');
      cardId = result.current.addCard(deckId, 'Q', 'A');
      result.current.startSession(deckId);
    });

    const cardBefore = result.current.state.decks[0].cards[0];
    expect(cardBefore.status).toBe('new');

    act(() => {
      result.current.rateCard(cardId, 4);
    });

    const cardAfter = result.current.state.decks[0].cards[0];
    expect(cardAfter.status).not.toBe('new'); // should transition out of 'new'
    expect(result.current.state.activeSession?.cardsReviewed).toHaveLength(1);
  });
});
