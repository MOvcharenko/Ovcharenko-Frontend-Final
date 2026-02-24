import { useParams, Link } from 'react-router-dom';
import { useFlashcards } from '../hooks/useFlashcards';

function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { addCard, deleteCard, resetDeck, getDeckById, getDeckStats } = useFlashcards();

  const deck = deckId ? getDeckById(deckId) : null;

  if (!deck) {
    return <p>Deck not found.</p>;
  }

  const stats = getDeckStats(deck.id);

  function handleAddCard() {
    if (!deck) return;
    const front = prompt('Card front (question):');
    if (!front?.trim()) return;
    const back = prompt('Card back (answer):');
    if (!back?.trim()) return;
    addCard(deck.id, front.trim(), back.trim());
  }

  return (
    <div className="deck-detail-page">
      <h1>{deck.title}</h1>

      <section className="deck-info">
        <p className="deck-description">{deck.description}</p>
        {stats && (
          <div className="deck-stats">
            <span>Total: {stats.total}</span>
            <span>New: {stats.newCards}</span>
            <span>Learning: {stats.learning}</span>
            <span>Mastered: {stats.mastered}</span>
          </div>
        )}
      </section>

      <section className="cards-list">
        <h2>Cards</h2>
        <button onClick={handleAddCard}>+ Add Card</button>
        <button onClick={() => resetDeck(deck.id)}>Reset Deck Progress</button>

        {deck.cards.length === 0 ? (
          <p>No cards yet — add one above!</p>
        ) : (
          <div className="cards">
            {deck.cards.map(card => (
              <div key={card.id} className={`card card-${card.status}`}>
                <div className="card-front"><strong>Q:</strong> {card.front}</div>
                <div className="card-back"><strong>A:</strong> {card.back}</div>
                <small>Status: {card.status} | Due: {card.dueDate.slice(0, 10)}</small>
                <button onClick={() => deleteCard(deck.id, card.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="action-section">
        <Link to={`/decks/${deck.id}/study`} className="btn btn-primary">
          Start Study Session
        </Link>
      </section>
    </div>
  );
}

export default DeckDetailPage;