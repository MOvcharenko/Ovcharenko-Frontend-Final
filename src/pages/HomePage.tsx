import { Link } from 'react-router-dom';
import { useFlashcards } from '../hooks/useFlashcards';

function HomePage() {
  const { state, addDeck, deleteDeck, getCardsDueToday } = useFlashcards();

  const cardsDueToday = getCardsDueToday().length;

  function handleCreateDeck() {
    const title = prompt('Deck title:');
    if (!title?.trim()) return;
    const description = prompt('Deck description:') ?? '';
    addDeck(title.trim(), description.trim());
  }

  return (
    <div className="home-page">
      <h1>Study Flashcard System</h1>
      <p className="subtitle">Welcome to FlashFlow</p>

      <section className="stats">
        <div className="stat-card">
          <h3>{cardsDueToday}</h3>
          <p>Cards Due Today</p>
        </div>
        <div className="stat-card">
          <h3>{state.decks.length}</h3>
          <p>Total Decks</p>
        </div>
      </section>

      <section className="decks-section">
        <h2>Your Decks</h2>
        {state.decks.length === 0 ? (
          <p>No decks yet — create one below!</p>
        ) : (
          <div className="decks-list">
            {state.decks.map(deck => (
              <div key={deck.id} className="deck-item">
                <Link to={`/decks/${deck.id}`}>
                  <h3>{deck.title}</h3>
                  <p>{deck.description}</p>
                  <small>{deck.cards.length} cards</small>
                </Link>
                <button onClick={() => deleteDeck(deck.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="action-section">
        <button onClick={handleCreateDeck}>+ Create New Deck</button>
      </section>
    </div>
  );
}

export default HomePage;