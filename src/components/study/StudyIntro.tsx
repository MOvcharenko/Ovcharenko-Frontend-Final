import { Link } from 'react-router-dom';

interface StudyIntroProps {
  deckTitle: string;
  dueCount: number;
  onStart: () => void;
  deckId: string;
}

export default function StudyIntro({ deckTitle, dueCount, onStart, deckId }: StudyIntroProps) {
  return (
    <div className="study-intro">
      <h1>Study: {deckTitle}</h1>
      <p>{dueCount} cards due today.</p>
      {dueCount === 0 ? (
        <>
          <p>No cards due — come back later!</p>
          <Link to={`/decks/${deckId}`}>Back to Deck</Link>
        </>
      ) : (
        <button onClick={onStart}>Start Session</button>
      )}
    </div>
  );
}
