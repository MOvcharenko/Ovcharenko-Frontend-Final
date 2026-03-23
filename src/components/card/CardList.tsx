import React from 'react';
import type { Card } from '../../types';
import CardListItem from './CardListItem';

interface CardListProps {
  cards: Card[];
  onDelete?: (cardId: string) => void;
  showDue?: boolean;
}

function CardList({ cards, onDelete, showDue = false }: CardListProps) {
  if (cards.length === 0) {
    return <p>No cards yet — add one above!</p>;
  }

  return (
    <div className="cards">
      {cards.map((card) => (
        <CardListItem key={card.id} card={card} onDelete={onDelete} showDue={showDue} />
      ))}
    </div>
  );
}

export default React.memo(CardList);
