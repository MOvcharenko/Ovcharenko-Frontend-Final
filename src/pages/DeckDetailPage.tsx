import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFlashcardsContext } from '../context/FlashcardsContext';
import DeckStats from '../components/deck/DeckStats';
import CardList from '../components/card/CardList';
import CardCreateForm from '../components/card/CardCreateForm';
import PageTitle from '../components/common/PageTitle';
import Subtitle from '../components/common/Subtitle';

function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { addCard, deleteCard, resetDeck, getDeckById, getDeckStats } = useFlashcardsContext();

  const deck = deckId ? getDeckById(deckId) : null;

  if (!deck) {
    return <p>Deck not found.</p>;
  }

  const stats = getDeckStats(deck.id);

  function handleCreateCard(front: string, back: string) {
    if (!deck) return;
    addCard(deck.id, front, back);
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
        <CardCreateForm onCreate={handleCreateCard} />
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

export default React.memo(DeckDetailPage);