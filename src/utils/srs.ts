import type { Card, Rating, CardStatus } from '../types';

const MS_PER_DAY = 86_400_000;

function addDays(days: number): string {
  return new Date(Date.now() + days * MS_PER_DAY).toISOString();
}

export function computeNextReview(
  card: Card,
  rating: Rating
): Pick<Card, 'interval' | 'easeFactor' | 'dueDate' | 'status'> {
  let { interval, easeFactor } = card;

  switch (rating) {
    case 'again':
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    case 'hard':
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;
    case 'good':
      interval = Math.max(1, Math.round(interval * easeFactor));
      break;
    case 'easy':
      interval = Math.max(1, Math.round(interval * easeFactor * 1.3));
      easeFactor = easeFactor + 0.15;
      break;
  }

  const status: CardStatus =
    rating === 'again' || rating === 'hard'
      ? 'learning'
      : rating === 'good'
      ? 'review'
      : 'mastered';

  return { interval, easeFactor, dueDate: addDays(interval), status };
}

export function isCardDueToday(card: Card): boolean {
  return new Date(card.dueDate) <= new Date();
}