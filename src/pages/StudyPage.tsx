import React from 'react';
import { useParams } from 'react-router-dom';
import { useFlashcardsContext } from '../context/FlashcardsContext';
import StudySession from '../components/study/StudySession';
import PageTitle from '../components/common/PageTitle';

function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const { state, startSession, rateCard, endSession, getDeckById, getSessionStats, getCardsDueToday } =
    useFlashcardsContext();

  const deck = deckId ? getDeckById(deckId) : null;
  const dueCards = deckId ? getCardsDueToday(deckId) : [];
  const session = state.activeSession;

  if (!deck) return <p>Deck not found.</p>;

  return (
    <>
      <PageTitle>Study: {deck.title}</PageTitle>
      <StudySession
        deckId={deck.id}
        deckTitle={deck.title}
        dueCards={dueCards}
        session={session}
        startSession={startSession}
        rateCard={rateCard}
        endSession={endSession}
        getSessionStats={getSessionStats}
      />
    </>
  );
}

export default React.memo(StudyPage);
