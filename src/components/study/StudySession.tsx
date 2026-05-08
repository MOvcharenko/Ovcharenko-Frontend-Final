import { useState } from 'react';
import type { Card, Rating } from '../../types';
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
  session: _session, // prefixed with underscore to indicate intentionally unused
  startSession,
  rateCard,
  endSession,
  getSessionStats,
}: StudySessionProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Snapshot the due cards at session start so they don't disappear mid-session
  const [sessionCards] = useState<Card[]>(() => [...dueCards]);

  function handleStart() {
    startSession(deckId);
    setSessionStarted(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  }

  function handleRating(rating: Rating) {
    const card = sessionCards[currentIndex];
    if (!card) return;

    rateCard(card.id, rating);

    if (currentIndex >= sessionCards.length - 1) {
      setIsComplete(true);
      endSession();
    } else {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }

  if (isComplete) {
    const stats = getSessionStats();
    return stats ? (
      <SessionSummary
        deckId={deckId}
        total={stats.total}
        correct={stats.correct}
        incorrect={stats.incorrect}
        accuracy={stats.accuracy}
      />
    ) : (
      <SessionSummary
        deckId={deckId}
        total={sessionCards.length}
        correct={0}
        incorrect={0}
        accuracy={0}
      />
    );
  }

  if (!sessionStarted) {
    return (
      <StudyIntro
        deckTitle={deckTitle}
        dueCount={dueCards.length}
        onStart={handleStart}
        deckId={deckId}
      />
    );
  }

  const currentCard = sessionCards[currentIndex];
  if (!currentCard) return <p>No cards to study.</p>;

  return (
    <div className="study-page">
      <StudyHeader
        title={`Study: ${deckTitle}`}
        progressText={`Card ${currentIndex + 1} of ${sessionCards.length}`}
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