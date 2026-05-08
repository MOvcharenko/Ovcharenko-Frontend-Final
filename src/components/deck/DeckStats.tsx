interface DeckStatsProps {
  total: number;
  newCards: number;
  learning: number;
  review: number;
  mastered: number;
}

export default function DeckStats({ total, newCards, learning, review, mastered }: DeckStatsProps) {
  return (
    <div className="deck-stats">
      <span>Total: {total}</span>
      <span>New: {newCards}</span>
      <span>Learning: {learning}</span>
      <span>Review: {review}</span>
      <span>Mastered: {mastered}</span>
    </div>
  );
}