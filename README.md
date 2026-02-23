# FlashFlow - Study Flashcard System

A modern, efficient flashcard study application built with React, TypeScript, and Vite. Leveraging spaced repetition systems (SRS) to optimize learning efficiency.

## App Theme

I chose the Study Flashcard System because it strikes a strong balance between technical depth and personal utility. I actively use flashcard tools for studying, so I have a clear mental model of what good UX looks like and a genuine interest in building something I'd actually want to use. On the complexity side, implementing a spaced repetition algorithm (SM-2) introduces real business logic beyond simple CRUD — each card rating triggers a computation that updates interval, ease factor, and due date, which means state changes have meaningful consequences and need to be modeled carefully. The deck/card/session relationship also creates interesting data management challenges around filtering due cards across decks and tracking session statistics in real time. 

FlashFlow is designed as a clean, distraction-free study companion that emphasizes rapid card review and progressive mastery. The interface prioritizes quick feedback loops and visual clarity to support focused study sessions.

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: CSS modules and vanilla CSS

## Core Entities

### 1. **Deck**
A collection of related flashcards organized by topic or subject.

```typescript
interface Deck {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  cards: Card[];
}
```

### 2. **Card**
An individual flashcard with study metadata and SRS tracking.

```typescript
interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: Tag[];
  status: CardStatus;
  interval: number;
  easeFactor: number;
  dueDate: string;
  createdAt: string;
  lastReviewedAt: string | null;
}
```

**Card Status**: `"new"` | `"learning"` | `"review"` | `"mastered"`

### 3. **StudySession**
An active study session tracking card reviews and ratings.

```typescript
interface StudySession {
  deckId: string;
  startedAt: string;
  cardsReviewed: {
    cardId: string;
    rating: Rating;
  }[];
  isComplete: boolean;
}
```

## Spaced Repetition System (SRS)

FlashFlow implements a **simplified SM-2 (SuperMemo 2) algorithm** to calculate optimal review intervals based on card difficulty and your performance.

### Ratings & Next Review Calculation

When reviewing a card, you provide one of four ratings:

- **Again** (Forgotten)
  - Interval resets to 1 day
  - Ease Factor decreases by 0.2 (minimum 1.3)
  - Status changes to "learning"

- **Hard** (Difficult)
  - Interval multiplied by 1.2
  - Ease Factor decreases by 0.15
  - Status changes to "learning"

- **Good** (Correct)
  - Interval multiplied by Ease Factor
  - Ease Factor unchanged
  - Status changes to "review"

- **Easy** (Very Easy)
  - Interval multiplied by Ease Factor × 1.3
  - Ease Factor increases by 0.15
  - Status changes to "mastered"

The algorithm automatically calculates the next due date based on the new interval, scheduling cards at optimal times for retention.

## Project Structure

```
src/
├── types.ts              # TypeScript interfaces and types
├── utils/
│   └── srs.ts            # SM-2 algorithm implementation
├── pages/
│   ├── HomePage.tsx      # Deck list and statistics
│   ├── DeckDetailPage.tsx# Deck details and card list
│   └── StudyPage.tsx     # Card review interface
├── App.tsx               # Main router configuration
└── main.tsx              # Application entry point
```

## Route Structure

- **`/`** → Home page with deck list and daily stats
- **`/decks/:deckId`** → Deck details and card list
- **`/decks/:deckId/study`** → Active study session

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Check TypeScript
npm run lint
```

## Notes

This scaffolding was created with AI assistance using Claude Haiku 4.5.
