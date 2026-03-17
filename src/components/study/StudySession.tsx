import { useState } from 'react';
import type { Card, Rating } from '../types';
import CardFlip from '../card/CardFlip';
import RatingButtons from './RatingButtons';
import SessionSummary from './SessionSummary';
import StudyIntro from './StudyIntro';
import StudyHeader from './StudyHeader';

interface StudySessionProps {
  deckId: string;
  deckTitle: string;
  dueCards: Card[];
  session: { isComplete: boolean } | null;
  startSession: (deckId: string) => void;
  rateCard: (cardId: string, rating: Rating) => void;
  endSession: () => void;
  getSessionStats: () =>
    | { correct: number; incorrect: number; accuracy: number; total: number }
    | null;
}

export default function StudySession({
  deckId,
  deckTitle,
  dueCards,
  session,
  startSession,
  rateCard,
  endSession,
  getSessionStats,
}: StudySessionProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  function handleStart() {
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
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }

  if (session?.isComplete) {
    const stats = getSessionStats();
    return stats ? (
      <SessionSummary
        deckId={deckId}
        total={stats.total}
        correct={stats.correct}
        incorrect={stats.incorrect}
        accuracy={stats.accuracy}
      />
    ) : null;
  }

  if (!sessionStarted) {
    return (
      <>
        <StudyIntro
          deckTitle={deckTitle}
          dueCount={dueCards.length}
          onStart={handleStart}
          deckId={deckId}
        />
      </>
    );
  }

  const currentCard = dueCards[currentIndex];
  if (!currentCard) return <p>No cards to study.</p>;

  return (
    <div className="study-page">
      <StudyHeader
        title={`Study: ${deckTitle}`}
        progressText={`Card ${currentIndex + 1} of ${dueCards.length}`}
      />

      <div className="study-container">
        <CardFlip
          front={currentCard.front}
          back={currentCard.back}
          flipped={isFlipped}
          onFlip={() => setIsFlipped((f) => !f)}
        />

        {isFlipped && <RatingButtons onRate={handleRating} />}
      </div>
    </div>
  );
}
