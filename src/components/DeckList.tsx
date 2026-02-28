import { ReactNode } from 'react';
import type { Deck } from '../types';
import { Link } from 'react-router-dom';

interface DeckListProps {
  decks: Deck[];
  onDelete?: (deckId: string) => void;
  renderItem?: (deck: Deck) => ReactNode;
}

export default function DeckList({ decks, onDelete, renderItem }: DeckListProps) {
  if (renderItem) {
    return <>{decks.map((d) => renderItem(d))}</>;
  }

  if (decks.length === 0) {
    return <p>No decks yet — create one below!</p>;
  }

  return (
    <div className="decks-list">
      {decks.map((deck) => (
        <div key={deck.id} className="deck-item">
          <Link to={`/decks/${deck.id}`}>
            <h3>{deck.title}</h3>
            <p>{deck.description}</p>
            <small>{deck.cards.length} cards</small>
          </Link>
          {onDelete && (
            <button onClick={() => onDelete(deck.id)}>Delete</button>
          )}
        </div>
      ))}
    </div>
  );
}
