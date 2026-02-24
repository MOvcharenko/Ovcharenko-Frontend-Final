import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Rating } from '../types';
import { useFlashcards } from '../hooks/useFlashcards';

function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { state, startSession, rateCard, endSession, getDeckById, getSessionStats, getCardsDueToday } =
    useFlashcards();

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  const deck = deckId ? getDeckById(deckId) : null;
  const dueCards = deckId ? getCardsDueToday(deckId) : [];
  const session = state.activeSession;

  function handleStart() {
    if (!deckId) return;
    startSession(deckId);
    setSessionStarted(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  function handleRating(rating: Rating) {
    const card = dueCards[currentIndex];
    if (!card) return;

    rateCard(card.id, rating);

    if (currentIndex >= dueCards.length - 1) {
      endSession();
    } else {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    }
  }

  if (!deck) return <p>Deck not found.</p>;

  // Session complete
  if (session?.isComplete) {
    const stats = getSessionStats();
    return (
      <div className="study-page">
        <h1>Session Complete! 🎉</h1>
        {stats && (
          <div className="session-stats">
            <p>Cards reviewed: {stats.total}</p>
            <p>Correct (good/easy): {stats.correct}</p>
            <p>Incorrect (hard/again): {stats.incorrect}</p>
            <p>Accuracy: {stats.accuracy}%</p>
          </div>
        )}
        <Link to={`/decks/${deck.id}`}>Back to Deck</Link>
      </div>
    );
  }

  // Pre-session screen
  if (!sessionStarted) {
    return (
      <div className="study-page">
        <h1>Study: {deck.title}</h1>
        <p>{dueCards.length} cards due today.</p>
        {dueCards.length === 0 ? (
          <>
            <p>No cards due — come back later!</p>
            <Link to={`/decks/${deck.id}`}>Back to Deck</Link>
          </>
        ) : (
          <button onClick={handleStart}>Start Session</button>
        )}
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  if (!currentCard) return <p>No cards to study.</p>;

  return (
    <div className="study-page">
      <div className="study-header">
        <h1>Study: {deck.title}</h1>
        <div className="progress">
          Card {currentIndex + 1} of {dueCards.length}
        </div>
      </div>

      <div className="study-container">
        <div
          className={`card-flip-container ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(f => !f)}
        >
          <div className="card-content">
            <p>{isFlipped ? currentCard.back : currentCard.front}</p>
            <small>{isFlipped ? 'Answer' : 'Question'} — click to flip</small>
          </div>
        </div>

        {isFlipped && (
          <div className="rating-buttons">
            <button className="btn btn-again" onClick={() => handleRating('again')}>Again</button>
            <button className="btn btn-hard"  onClick={() => handleRating('hard')}>Hard</button>
            <button className="btn btn-good"  onClick={() => handleRating('good')}>Good</button>
            <button className="btn btn-easy"  onClick={() => handleRating('easy')}>Easy</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyPage;