# FlashFlow — Copilot Instructions

## Project Overview
A Study Flashcard System built with React, TypeScript, and Vite.
Features spaced repetition (SM-2 algorithm), deck/card CRUD, and study sessions.
State is managed via Zustand store with persist middleware for localStorage.
API operations are abstracted through a service layer.

## Tech Stack
- React 18 + TypeScript (strict mode)
- React Router v6
- Vite
- Zustand (state management with persist middleware)
- Vitest + @testing-library/react for tests
- No external UI libraries — plain className-based styling

## Architecture
- `src/types.ts` — single source of truth for all types, import from here always
- `src/store/flashcardsStore.ts` — Zustand store with all state, actions, and persist middleware for localStorage
- `src/hooks/useFlashcards.ts` — wrapper hook around the store, exposes state and actions to components
- `src/context/FlashcardsContext.tsx` — provides the wrapped hook to all pages
- `src/services/api.ts` — API service interface and placeholder implementations for backend operations
- `src/utils/srs.ts` — pure SM-2 spaced repetition logic, no React
- `src/utils/storage.ts` — localStorage helpers, no React
- `src/pages/` — page components, always consume state via `useFlashcardsContext()`
- `src/components/` — reusable abstract components for the pages

## Code Rules
- All files must use `.tsx` or `.ts` — never `.jsx` or `.js`
- Import all types from `src/types.ts`, never redefine them locally
- Pages must use `useFlashcardsContext()`, never call `useFlashcards()` directly
- All state updates must be immutable (spread, never mutate)
- New operations belong in `src/store/flashcardsStore.ts` (Zustand store), not components or hooks
- The wrapper hook (`useFlashcards.ts`) selects and binds store actions; keep it thin
- API calls belong in `src/services/api.ts`, not inside store actions
- Pure logic (no React deps) belongs in `src/utils/`, not in hooks or components
- `tsc --noEmit` must pass with zero errors before any change is considered done

## Testing
- Tests live in `src/hooks/useFlashcards.test.ts`
- Use `renderHook` + `act` from `@testing-library/react`
- `beforeEach` clears localStorage and resets store state to ensure clean tests
- Every new operation added to the store needs at least one corresponding test
- Test edge cases: empty state, invalid/missing IDs, no active session

## Do Not
- Install new dependencies without being asked
- Add inline styles — use classNames
- Use `any` types
- Put fetch calls or business logic inside page components
- Duplicate type definitions