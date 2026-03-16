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
- **Backend**: Local Express.js server with file-based JSON storage
- **Authentication**: None (local app, no user accounts)

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
├── types.ts                    # Single source of truth for TypeScript interfaces
├── App.tsx                     # Main router and layout component
├── main.tsx                    # React entry point with BrowserRouter + FlashcardsProvider
│
├── context/
│   └── FlashcardsContext.tsx   # Context provider for state distribution across pages
│
├── hooks/
│   ├── useFlashcards.ts        # Custom hook: all state operations (CRUD + queries)
│   └── useFlashcards.test.ts   # Unit tests for hook (20 tests covering all operations)
│
├── components/
│   ├── DeckList.tsx            # Renders list of decks with optional delete
│   ├── DeckStats.tsx           # Shows deck statistics (total, new, learning, mastered)
│   ├── CardList.tsx            # Renders list of cards in a deck
│   ├── CardFlip.tsx            # Flip animation and interaction for card review
│   ├── RatingButtons.tsx       # Four rating buttons (Again, Hard, Good, Easy)
│   ├── StatsCard.tsx           # Single stat display card
│   ├── SessionSummary.tsx      # End-of-session stats and navigation
│   ├── StudyIntro.tsx          # Pre-session screen showing card count
│   ├── StudyHeader.tsx         # Progress indicator (e.g., "Card 1 of 5")
│   ├── NavBar.tsx              # Top navigation with FlashFlow branding
│   ├── PageTitle.tsx           # Page heading abstraction
│   └── Subtitle.tsx            # Secondary heading abstraction
│
├── pages/
│   ├── HomePage.tsx            # Deck list, stats, create deck button
│   ├── DeckDetailPage.tsx      # Deck details, card management, start session button
│   └── StudyPage.tsx           # Active study session with card flip and ratings
│
├── utils/
│   ├── srs.ts                  # Pure SM-2 algorithm: computeNextReview()
│   └── storage.ts              # localStorage helpers (used by store middleware)
│
├── test/
│   └── setup.ts                # Vitest + @testing-library setup
│
└── CSS/
    ├── index.css               # Global styles
    └── App.css                 # Component-specific styles

server/
├── index.ts                   # Express server entry point (API routes + CORS)
├── router.ts                  # REST API route definitions for decks & cards
├── storage.ts                 # File-backed JSON persistence helper
├── data/
│   └── db.json                # Runtime storage (created automatically)
└── tsconfig.json              # TypeScript config for server code
```

### Architecture Notes

- **Single source of truth**: All types defined in `src/types.ts`; all imports use `import type`
- **State management**: `useFlashcards` hook wraps a Zustand store which now persists deck data to `localStorage` via middleware
- **Context distribution**: `FlashcardsContext` wraps the entire app (in `main.tsx`), making hook output available to all pages
- **Component abstraction**: Pages compose reusable UI components; no raw HTML/CSS in pages
- **Pure utilities**: `srs.ts` contains zero React dependencies; can be tested independently
```

Data is persisted on the backend in a file at `server/data/db.json`. The Express server
stores the full `AppState` object with decks and active session information; the file is
automatically created when the server first receives a write. **Both frontend and backend
must be running simultaneously for the application to function.**

## Route Structure

- **`/`** → Home page with deck list and daily stats
- **`/decks/:deckId`** → Deck details and card list
- **`/decks/:deckId/study`** → Active study session

## Getting Started

```bash
# Install dependencies (frontend & backend packages)
npm install

# Start the frontend dev server
npm run dev

# In a separate terminal, start the backend API server
npm run server

# Build for production
npm run build

# Check TypeScript
npm run lint
```

---

## Project 5: Backend & Persistence

### Backend Choice

**Express.js with file-based JSON storage** (`server/data/db.json`). Chosen because it matches the existing TypeScript stack with zero additional infrastructure — no database server to install or configure, data is human-readable and inspectable, and the full `AppState` shape from `src/types.ts` maps directly to the file without a schema migration layer.

### Authentication

Authentication is not implemented. FlashFlow is a single-user local application — it runs entirely on `localhost` with no user accounts, no login flow, and no protected routes. Adding auth would introduce complexity (session tokens, protected route guards, a login page) that is out of scope for a personal study tool with no multi-user or remote access requirements.

### How to Run

Both the frontend and backend must be running simultaneously. Open two terminals:

**Terminal 1 — Frontend:**
```bash
npm install       # first time only
npm run dev       # starts Vite on http://localhost:5173
```

**Terminal 2 — Backend:**
```bash
npm run server    # starts Express on http://localhost:3001
```

The backend creates `server/data/db.json` automatically on the first write. If the file does not exist yet, all read operations return empty defaults — no manual setup required.

> **Note:** The frontend will load but all deck operations will fail with network errors if the backend is not running.

## Features

FlashFlow provides a comprehensive flashcard study experience with the following capabilities:

- **Deck Management**: Create, edit, and delete flashcard decks to organize your study material by topic or subject
- **Card Creation**: Add new flashcards to decks with front/back content, tags, and automatic SRS initialization
- **Card Editing**: Modify existing cards, update content, add/remove tags, or reset SRS progress
- **Spaced Repetition Study**: Review cards using the SM-2 algorithm that optimizes review timing based on your performance
- **Rating System**: Rate each card during study (Again, Hard, Good, Easy) to adjust future review intervals
- **Progress Tracking**: Monitor your learning progress with deck statistics showing total, new, learning, and mastered cards
- **Study Sessions**: Start focused study sessions for specific decks, reviewing only cards due for review
- **Session Statistics**: View detailed session summaries including cards reviewed, ratings given, and time spent
- **Data Persistence**: All data is automatically saved to a local file and survives page reloads and app restarts
- **Responsive Design**: Clean, distraction-free interface optimized for efficient study sessions
- **Local Operation**: No internet connection required - runs entirely on your local machine with no user accounts

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

The project structure and initial scaffolding were generated with AI assistance (via Copilot and Claude), while custom hook logic, tests, and architectural decisions were hand-crafted based on project requirements.