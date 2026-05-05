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
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <Link className="btn btn-outline" to={`/decks/${deckId}`}>Back to Deck</Link>
            <Link className="btn btn-ghost" to="/">Home</Link>
          </div>
        </>
      ) : (
        <button className="btn btn-primary" onClick={onStart}>Start Session</button>
      )}
    </div>
  );
}