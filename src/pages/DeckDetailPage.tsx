import React, { useState } from 'react';
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
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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
            review={stats.review}
            mastered={stats.mastered}
          />
        )}
      </section>

      <section className="cards-list">
        <h2>Cards</h2>
        <CardCreateForm onCreate={handleCreateCard} />
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => resetDeck(deck.id)}>Reset Deck Progress</button>
        </div>

        <CardList
          cards={deck.cards}
          onDelete={(cardId) => deleteCard(deck.id, cardId)}
          showDue
        />
      </section>

      {/* ── SRS How It Works ──────────────────────────── */}
      <section className="srs-explainer">
        <button
          className="btn btn-ghost srs-toggle"
          onClick={() => setShowHowItWorks((v) => !v)}
        >
          {showHowItWorks ? '▲' : '▼'} How Review Scheduling Works
        </button>
        {showHowItWorks && (
          <div className="srs-content">
            <p className="srs-intro">
              FlashFlow uses a <strong>spaced repetition algorithm (SM-2)</strong> to
              schedule reviews at the optimal time for long-term retention. Each time
              you rate a card, its next review date is calculated automatically.
            </p>
            <div className="srs-ratings">
              <div className="srs-rating srs-rating-again">
                <span className="srs-rating-label">Again</span>
                <span className="srs-rating-desc">You forgot the answer</span>
                <ul>
                  <li>Interval → <strong>1 day</strong></li>
                  <li>Ease ↓ <strong>−0.20</strong> (min 1.3)</li>
                  <li>Status → <strong className="text-warning">learning</strong></li>
                </ul>
              </div>
              <div className="srs-rating srs-rating-hard">
                <span className="srs-rating-label">Hard</span>
                <span className="srs-rating-desc">You recalled with difficulty</span>
                <ul>
                  <li>Interval × <strong>1.2</strong></li>
                  <li>Ease ↓ <strong>−0.15</strong></li>
                  <li>Status → <strong className="text-warning">learning</strong></li>
                </ul>
              </div>
              <div className="srs-rating srs-rating-good">
                <span className="srs-rating-label">Good</span>
                <span className="srs-rating-desc">You recalled correctly</span>
                <ul>
                  <li>Interval × <strong>Ease Factor</strong></li>
                  <li>Ease → <strong>unchanged</strong></li>
                  <li>Status → <strong className="text-success">review</strong></li>
                </ul>
              </div>
              <div className="srs-rating srs-rating-easy">
                <span className="srs-rating-label">Easy</span>
                <span className="srs-rating-desc">You recalled effortlessly</span>
                <ul>
                  <li>Interval × Ease × <strong>1.3</strong></li>
                  <li>Ease ↑ <strong>+0.15</strong></li>
                  <li>Status → <strong className="text-success">mastered</strong></li>
                </ul>
              </div>
            </div>
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

export default React.memo(DeckDetailPage);