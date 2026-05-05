import { Link } from 'react-router-dom';

interface SessionSummaryProps {
  deckId: string;
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export default function SessionSummary({ deckId, total, correct, incorrect, accuracy }: SessionSummaryProps) {
  return (
    <div className="session-summary">
      <h1>Session Complete! 🎉</h1>
      <p><span>Cards reviewed:</span> <span>{total}</span></p>
      <p><span>Correct (good/easy):</span> <span>{correct}</span></p>
      <p><span>Incorrect (hard/again):</span> <span>{incorrect}</span></p>
      <p><span>Accuracy:</span> <span>{accuracy}%</span></p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
        <Link className="btn btn-primary" to={`/decks/${deckId}`}>Back to Deck</Link>
        <Link className="btn btn-outline" to="/">Home</Link>
      </div>
    </div>
  );
}