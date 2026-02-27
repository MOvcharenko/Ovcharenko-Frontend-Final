import { Card } from '../types';

interface CardListProps {
  cards: Card[];
  onDelete?: (cardId: string) => void;
  showDue?: boolean;
}

export default function CardList({ cards, onDelete, showDue = false }: CardListProps) {
  if (cards.length === 0) {
    return <p>No cards yet — add one above!</p>;
  }

  return (
    <div className="cards">
      {cards.map((card) => (
        <div key={card.id} className={`card card-${card.status}`}>
          <div className="card-front">
            <strong>Q:</strong> {card.front}
          </div>
          <div className="card-back">
            <strong>A:</strong> {card.back}
          </div>
          {showDue && <small>Due: {card.dueDate.slice(0, 10)}</small>}
          {onDelete && <button onClick={() => onDelete(card.id)}>Delete</button>}
        </div>
      ))}
    </div>
  );
}
