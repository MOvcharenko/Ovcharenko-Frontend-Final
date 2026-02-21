/**
 * Type definitions for the Study Flashcard System
 */

/** A tag is simply a string label */
export type Tag = string;

/** Rating given after reviewing a card */
export type Rating = "again" | "hard" | "good" | "easy";

/** Current status of a card in the learning process */
export type CardStatus = "new" | "learning" | "review" | "mastered";

/** A single flashcard in a deck */
export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: Tag[];
  status: CardStatus;
  interval: number; // in days
  easeFactor: number; // SM-2 ease factor
  dueDate: string; // ISO string
  createdAt: string; // ISO string
  lastReviewedAt: string | null; // ISO string or null
}

/** A collection of flashcards with metadata */
export interface Deck {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO string
  cards: Card[];
}

/** Represents an active study session */
export interface StudySession {
  deckId: string;
  startedAt: string; // ISO string
  cardsReviewed: {
    cardId: string;
    rating: Rating;
  }[];
  isComplete: boolean;
}

/** Global application state */
export interface AppState {
  decks: Deck[];
  activeSession: StudySession | null;
}
