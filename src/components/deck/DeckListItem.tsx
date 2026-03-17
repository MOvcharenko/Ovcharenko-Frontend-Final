import React from 'react';
import type { Deck } from '../types';
import { Link } from 'react-router-dom';
import DeleteButton from '../common/DeleteButton';

interface DeckListItemProps {
  deck: Deck;
  onDelete?: (deckId: string) => void;
}

function DeckListItem({ deck, onDelete }: DeckListItemProps) {
  return (
    <div className="deck-item">
      <Link to={`/decks/${deck.id}`}>
        <h3>{deck.title}</h3>
        <p>{deck.description}</p>
        <small>{deck.cards.length} cards</small>
      </Link>
      {onDelete && (
        <DeleteButton onClick={() => onDelete(deck.id)} />
      )}
    </div>
  );
}

export default React.memo(DeckListItem);