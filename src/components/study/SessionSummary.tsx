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
      <p>Cards reviewed: {total}</p>
      <p>Correct (good/easy): {correct}</p>
      <p>Incorrect (hard/again): {incorrect}</p>
      <p>Accuracy: {accuracy}%</p>
      <Link className="btn btn-primary" to={`/decks/${deckId}`}>Back to Deck</Link>
    </div>
  );
}
