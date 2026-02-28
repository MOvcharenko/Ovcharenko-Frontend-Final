import { useParams, Link } from 'react-router-dom';
import { useFlashcardsContext } from '../context/FlashcardsContext';
import DeckStats from '../components/DeckStats';
import CardList from '../components/CardList';
import PageTitle from '../components/PageTitle';
import Subtitle from '../components/Subtitle';

function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { addCard, deleteCard, resetDeck, getDeckById, getDeckStats } = useFlashcardsContext();

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
      <PageTitle>{deck.title}</PageTitle>

      <section className="deck-info">
        <Subtitle>{deck.description}</Subtitle>
        {stats && (
          <DeckStats
            total={stats.total}
            newCards={stats.newCards}
            learning={stats.learning}
            mastered={stats.mastered}
          />
        )}
      </section>

      <section className="cards-list">
        <h2>Cards</h2>
        <button onClick={handleAddCard}>+ Add Card</button>
        <button onClick={() => resetDeck(deck.id)}>Reset Deck Progress</button>

        <CardList
          cards={deck.cards}
          onDelete={(cardId) => deleteCard(deck.id, cardId)}
          showDue
        />
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