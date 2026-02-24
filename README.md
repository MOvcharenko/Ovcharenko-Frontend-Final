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

## Hook Operations

1. **Deck management** – create, delete, and rename decks; state kept in `AppState.decks`.
2. **Card management** – add, remove, edit, reset single cards or entire decks; new cards start with default SRS values.
3. **Study session control** – start a session, rate cards (which updates interval/ease/duedate via `computeNextReview`), and mark the session complete.
4. **Query helpers** – read-only helpers such as `getDeckById`, `getCardsDueToday`, `getSessionStats`, and `getDeckStats` provide derived information for UI components.
5. **State initialization utilities** – internal helpers like `makeCard` and `todayISO` keep timestamps and defaults consistent.

## Running Tests

```bash
npm install
npm run test
```

### Test Coverage

- **Deck operations** verify that decks start empty, can be added, updated, and deleted individually.
- **Card operations** ensure cards are assigned to the correct deck, can be edited, removed, and reset to default SRS values.
- **Study session behavior** covers session start/end, rating a card updates its SRS fields and session history, and statistics calculations.
- **Derived query tests** confirm `getDeckById`, `getDeckStats`, and `getCardsDueToday` return accurate results across states.
- **Edge cases** handle scenarios like deleting the active deck, rating without an active session, and missing deck lookups.

### AI Usage Statement

The project structure and initial scaffolding were generated with AI assistance (internally via Copilot/Claude), while custom hook logic and tests were hand‑crafted based on requirements.
