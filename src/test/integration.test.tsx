import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { useFlashcardsStore } from '../store/flashcardsStore';
import '@testing-library/jest-dom/vitest';

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    fetchDecks: vi.fn(),
    createDeck: vi.fn(),
    updateDeck: vi.fn(),
    deleteDeck: vi.fn(),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    rateCard: vi.fn(),
    resetCard: vi.fn(),
  },
}));

import { api } from '../services/api';

beforeEach(() => {
  // reset global store state before each test
  useFlashcardsStore.setState({
    decks: [],
    activeSession: null,
    loading: false,
    error: null,
  });
  // reset all mocks
  vi.clearAllMocks();
});

// Helper to render the app with router
function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

describe('Integration Tests — Key User Flows', () => {
  it('allows creating a deck, adding cards, and studying them', async () => {
    const user = userEvent.setup();

    // Mock API responses
    const mockDeck = {
      id: 'test-deck-id',
      title: 'Integration Test Deck',
      description: 'Testing the full flow',
      createdAt: new Date().toISOString(),
      cards: [],
    };

    const mockCard1 = {
      id: 'card-1',
      front: 'What is 2+2?',
      back: '4',
      status: 'new' as const,
      deckId: 'test-deck-id',
      createdAt: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      dueDate: new Date().toISOString(),
      tags: [],
      lastReviewedAt: null,
    };

    const mockCard2 = {
      id: 'card-2',
      front: 'What is the capital of France?',
      back: 'Paris',
      status: 'new' as const,
      deckId: 'test-deck-id',
      createdAt: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      dueDate: new Date().toISOString(),
      tags: [],
      lastReviewedAt: null,
    };

    const ratedCard1 = {
      ...mockCard1,
      status: 'review' as const,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      lastReviewedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    vi.mocked(api.fetchDecks).mockResolvedValue({
      data: [mockDeck],
      error: null,
    });
    vi.mocked(api.createDeck).mockResolvedValue({
      data: mockDeck,
      error: null,
    });
    vi.mocked(api.createCard)
      .mockResolvedValueOnce({
        data: mockCard1,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockCard2,
        error: null,
      });
    vi.mocked(api.rateCard).mockResolvedValue({
      data: ratedCard1,
      error: null,
    });

    renderApp();

    // Wait for the app to load and show the home page
    await waitFor(() => {
      expect(screen.getByText('FlashFlow')).toBeInTheDocument();
    });

    // Navigate to deck creation
    const createDeckLink = screen.getByRole('link', { name: /create deck/i });
    await user.click(createDeckLink);

    // Fill out deck creation form
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const createButton = screen.getByRole('button', { name: /create/i });

    await user.type(titleInput, 'Integration Test Deck');
    await user.type(descriptionInput, 'Testing the full flow');
    await user.click(createButton);

    // Should navigate back to home and show the deck
    await waitFor(() => {
      expect(screen.getByText('Integration Test Deck')).toBeInTheDocument();
    });

    // Click on the deck to view details
    const deckLink = screen.getByRole('link', { name: /integration test deck/i });
    await user.click(deckLink);

    // Should be on deck detail page
    await waitFor(() => {
      expect(screen.getByText('Integration Test Deck')).toBeInTheDocument();
      expect(screen.getByText('Testing the full flow')).toBeInTheDocument();
    });

    // Add first card
    const addCardButton = screen.getByRole('button', { name: /add card/i });
    await user.click(addCardButton);

    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveCardButton = screen.getByRole('button', { name: /save/i });

    await user.type(frontInput, 'What is 2+2?');
    await user.type(backInput, '4');
    await user.click(saveCardButton);

    // Add second card
    await user.click(addCardButton);
    await user.type(screen.getByLabelText(/front/i), 'What is the capital of France?');
    await user.type(screen.getByLabelText(/back/i), 'Paris');
    await user.click(saveCardButton);

    // Should show both cards
    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    });

    // Start a study session
    const studyButton = screen.getByRole('button', { name: /start studying/i });
    await user.click(studyButton);

    // Should be in study mode
    await waitFor(() => {
      expect(screen.getByText('Study Session')).toBeInTheDocument();
    });

    // Show answer and rate the card
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    await user.click(showAnswerButton);

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    // Rate as "good"
    const goodButton = screen.getByRole('button', { name: /good/i });
    await user.click(goodButton);

    // Should continue to next card
    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    });

    // End session
    const endSessionButton = screen.getByRole('button', { name: /end session/i });
    await user.click(endSessionButton);

    // Should show session summary
    await waitFor(() => {
      expect(screen.getByText(/session complete/i)).toBeInTheDocument();
    });
  });

  it('handles error states gracefully', async () => {
    const user = userEvent.setup();

    // Mock API to return an error
    vi.mocked(api.createDeck).mockResolvedValue({
      data: null,
      error: 'Failed to create deck',
    });

    renderApp();

    // Navigate to deck creation
    const createDeckLink = screen.getByRole('link', { name: /create deck/i });
    await user.click(createDeckLink);

    // Try to create a deck
    const titleInput = screen.getByLabelText(/title/i);
    const createButton = screen.getByRole('button', { name: /create/i });

    await user.type(titleInput, 'Test Deck');
    await user.click(createButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to create deck')).toBeInTheDocument();
    });
  })})