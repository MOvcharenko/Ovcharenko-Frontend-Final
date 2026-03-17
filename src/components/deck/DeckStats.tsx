interface DeckStatsProps {
  total: number;
  newCards: number;
  learning: number;
  mastered: number;
}

export default function DeckStats({ total, newCards, learning, mastered }: DeckStatsProps) {
  return (
    <div className="deck-stats">
      <span>Total: {total}</span>
      <span>New: {newCards}</span>
      <span>Learning: {learning}</span>
      <span>Mastered: {mastered}</span>
    </div>
  );
}
