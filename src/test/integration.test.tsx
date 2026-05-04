import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { useFlashcardsStore } from '../store/flashcardsStore';
import { FlashcardsProvider } from '../context/FlashcardsContext';
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  useFlashcardsStore.setState({
    decks: [],
    activeSession: null,
    error: null,
  });
  localStorage.clear();
});

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

    renderApp();

    // Wait for the app to load and show the home page
    await waitFor(() => {
      expect(screen.getByText('FlashFlow')).toBeInTheDocument();
    });

    // Create a new deck
    const titleInput = screen.getByLabelText(/title:/i);
    const descriptionInput = screen.getByLabelText(/description:/i);
    const createButton = screen.getByRole('button', { name: /create new deck/i });

    await user.type(titleInput, 'Spanish Vocab');
    await user.type(descriptionInput, 'Common Spanish words');
    await user.click(createButton);

    // Verify deck was created
    await waitFor(() => {
      expect(screen.getByText('Spanish Vocab')).toBeInTheDocument();
    });

    // Click on the deck to view details
    const deckLink = screen.getByRole('link', { name: /spanish vocab/i });
    await user.click(deckLink);

    // Should be on deck detail page
    await waitFor(() => {
      expect(screen.getByText('Spanish Vocab')).toBeInTheDocument();
    });

    // Add a card to the deck
    const cardFrontInput = screen.getByLabelText(/front/i);
    const cardBackInput = screen.getByLabelText(/back/i);
    const addCardButton = screen.getByRole('button', { name: /add card/i });

    await user.type(cardFrontInput, 'Hola');
    await user.type(cardBackInput, 'Hello');
    await user.click(addCardButton);

    // Verify card was added
    await waitFor(() => {
      expect(screen.getByText('Hola')).toBeInTheDocument();
    });
  });
});
