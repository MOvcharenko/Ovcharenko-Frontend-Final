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
      <div className="card-front">
        <strong>Q:</strong> {card.front}
      </div>
      <div className="card-back">
        <strong>A:</strong> {card.back}
      </div>
      {showDue && <small>Due: {card.dueDate.slice(0, 10)}</small>}
      {onDelete && <DeleteButton onClick={() => onDelete(card.id)} />}
    </div>
  );
}

export default React.memo(CardListItem);