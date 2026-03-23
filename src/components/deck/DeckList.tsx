import React from 'react';
import type { Deck } from '../../types';
import DeckListItem from './DeckListItem';

interface DeckListProps {
  decks: Deck[];
  onDelete?: (deckId: string) => void;
}

function DeckList({ decks, onDelete }: DeckListProps) {
  if (decks.length === 0) {
    return <p>No decks yet — create one below!</p>;
  }

  return (
    <div className="decks-list">
      {decks.map((deck) => (
        <DeckListItem key={deck.id} deck={deck} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default React.memo(DeckList);
