/**
 * Spaced Repetition System (SRS) utility
 * Implements a simplified SM-2 (SuperMemo 2) algorithm for calculating next review dates
 */

/**
 * Spaced Repetition System (SRS) utility
 * Implements a simplified SM-2 (SuperMemo 2) algorithm for calculating next review dates
 */
import type { Card, Rating, CardStatus } from "../types";

interface NextReviewResult {
  interval: number;
  easeFactor: number;
  dueDate: string;
  status: CardStatus;
}

/**
 * Computes the next review interval and ease factor based on the SM-2 algorithm
 * @param card - The card being reviewed
 * @param rating - The rating given by the user
 * @returns Updated interval, easeFactor, dueDate, and status
 */
export function computeNextReview(
  card: Card,
  rating: Rating
): NextReviewResult {
  let newInterval = card.interval;
  let newEaseFactor = card.easeFactor;
  let newStatus: CardStatus = card.status;

  switch (rating) {
    case "again": {
      // Card forgotten - restart learning
      newInterval = 1;
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
      newStatus = "learning";
      break;
    }

    case "hard": {
      // Card difficult - slower progression
      newInterval = card.interval * 1.2;
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.15);
      newStatus = "learning";
      break;
    }

    case "good": {
      // Card good - normal progression
      newInterval = card.interval * card.easeFactor;
      newEaseFactor = card.easeFactor; // Unchanged
      newStatus = "review";
      break;
    }

    case "easy": {
      // Card easy - accelerate learning
      newInterval = card.interval * card.easeFactor * 1.3;
      newEaseFactor = card.easeFactor + 0.15;
      newStatus = "mastered";
      break;
    }
  }

  // Round interval to nearest integer
  newInterval = Math.round(newInterval);

  // Calculate due date: today + interval days
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + newInterval);
  const dueDateISO = dueDate.toISOString();

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    dueDate: dueDateISO,
    status: newStatus,
  };
}
