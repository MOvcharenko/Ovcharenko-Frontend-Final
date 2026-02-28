import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Rating } from '../types';
import { useFlashcardsContext } from '../context/FlashcardsContext';
import CardFlip from '../components/CardFlip';
import RatingButtons from '../components/RatingButtons';
import SessionSummary from '../components/SessionSummary';
import StudyIntro from '../components/StudyIntro';
import StudyHeader from '../components/StudyHeader';
import PageTitle from '../components/PageTitle';
import Subtitle from '../components/Subtitle';

function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { state, startSession, rateCard, endSession, getDeckById, getSessionStats, getCardsDueToday } =
    useFlashcardsContext();

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
    return stats ? (
      <SessionSummary
        deckId={deck.id}
        total={stats.total}
        correct={stats.correct}
        incorrect={stats.incorrect}
        accuracy={stats.accuracy}
      />
    ) : null;
  }

  // Pre-session screen
  if (!sessionStarted) {
    return (
      <>
        <PageTitle>Study: {deck.title}</PageTitle>
        <StudyIntro
          deckTitle={deck.title}
          dueCount={dueCards.length}
          onStart={handleStart}
          deckId={deck.id}
        />
      </>
    );
  }

  const currentCard = dueCards[currentIndex];
  if (!currentCard) return <p>No cards to study.</p>;

  return (
    <div className="study-page">
      <StudyHeader
        title={`Study: ${deck.title}`}
        progressText={`Card ${currentIndex + 1} of ${dueCards.length}`}
      />

      <div className="study-container">
        <CardFlip
          front={currentCard.front}
          back={currentCard.back}
          flipped={isFlipped}
          onFlip={() => setIsFlipped(f => !f)}
        />

        {isFlipped && <RatingButtons onRate={handleRating} />}
      </div>
    </div>
  );
}

export default StudyPage;