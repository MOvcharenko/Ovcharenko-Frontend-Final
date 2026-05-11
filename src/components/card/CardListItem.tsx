import React from 'react';
import type { Card } from '../../types';
import DeleteButton from '../common/DeleteButton';

interface CardListItemProps {
  card: Card;
  onDelete?: (cardId: string) => void;
  showDue: boolean;
}

function CardListItem({ card, onDelete, showDue }: CardListItemProps) {
  return (
    <div className={`card card-${card.status}`}>
      <div className="card-q">
        <strong>Q:</strong> {card.front}
      </div>
      <div className="card-a">
        <strong>A:</strong> {card.back}
      </div>
      {showDue && <small>Due: {card.dueDate.slice(0, 10)}</small>}
      {onDelete && <DeleteButton onClick={() => onDelete(card.id)} itemType="card" />}
    </div>
  );
}

export default React.memo(CardListItem);