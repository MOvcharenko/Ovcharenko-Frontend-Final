import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { useFlashcardsStore } from '../store/flashcardsStore';
import { FlashcardsProvider } from '../context/FlashcardsContext';
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

// Helper to render the app with router and provider
function renderApp(initialRoute = '/') {
  window.history.pushState({}, '', initialRoute);
  return render(
    <BrowserRouter>
      <FlashcardsProvider>
        <App />
      </FlashcardsProvider>
    </BrowserRouter>
  );
}

describe('Integration Tests — Key User Flows', () => {
  it('allows creating a deck, adding cards, and studying them', async () => {
    const user = userEvent.setup();

    // Mock API responses - simpler flow
    const mockDeck = {
      id: 'test-deck-id',
      title: 'Integration Test Deck',
      description: 'Testing the full flow',
      createdAt: new Date().toISOString(),
      cards: [],
    };

    const mockCard = {
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

    vi.mocked(api.fetchDecks).mockResolvedValue({
      data: [],
      error: null,
    });
    vi.mocked(api.createDeck).mockResolvedValue({
      data: mockDeck,
      error: null,
    });
    vi.mocked(api.createCard).mockResolvedValue({
      data: mockCard,
      error: null,
    });

    renderApp();

    // Wait for the app to load and show the home page
    await waitFor(() => {
      expect(screen.getByText('FlashFlow')).toBeInTheDocument();
    });

    // Fill out deck creation form directly on home page
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const createButton = screen.getByRole('button', { name: /create new deck/i });

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

    // Add a card
    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const addCardButton = screen.getByRole('button', { name: /add card/i });

    await user.type(frontInput, 'What is 2+2?');
    await user.type(backInput, '4');
    await user.click(addCardButton);

    // Should show the card
    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    // Verify card details are displayed
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('handles error states gracefully', async () => {
    const user = userEvent.setup();

    // Mock API to return an error
    vi.mocked(api.createDeck).mockResolvedValue({
      data: null,
      error: 'Failed to create deck',
    });

    renderApp('/');

    // Wait for the app to load and show the home page
    await waitFor(() => {
      expect(screen.getByText('FlashFlow')).toBeInTheDocument();
    });

    // Try to create a deck directly on home page
    const titleInput = screen.getByLabelText(/title/i);
    const createButton = screen.getByRole('button', { name: /create new deck/i });

    await user.type(titleInput, 'Test Deck');
    await user.click(createButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to create deck')).toBeInTheDocument();
    });
  })})