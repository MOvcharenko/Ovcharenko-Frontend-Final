import React from 'react';
import type { Deck } from '../../types';
import DeckListItem from './DeckListItem';

interface DeckListProps {
  decks: Deck[];
  onDelete?: (deckId: string) => void;
}

function DeckList({ decks, onDelete }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <div className="empty-state-title">No decks yet</div>
        <div className="empty-state-description">Create your first deck below to get started!</div>
      </div>
    );
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
