# FlashFlow — Copilot Instructions

## Project Overview
A Study Flashcard System built with React, TypeScript, and Vite.
Features spaced repetition (SM-2 algorithm), deck/card CRUD, and study sessions.
State is managed via a custom hook (`useFlashcards`) shared through React Context.
Data is persisted to localStorage via `src/utils/storage.ts`.

## Tech Stack
- React 18 + TypeScript (strict mode)
- React Router v6
- Vite
- Vitest + @testing-library/react for tests
- No external UI libraries — plain className-based styling

## Architecture
- `src/types.ts` — single source of truth for all types, import from here always
- `src/hooks/useFlashcards.ts` — all state and operations live here
- `src/context/FlashcardsContext.tsx` — provides the hook to all pages
- `src/utils/srs.ts` — pure SM-2 spaced repetition logic, no React
- `src/utils/storage.ts` — localStorage read/write, no React
- `src/pages/` — page components, always consume state via `useFlashcardsContext()`
- `src/components/` — reusable abstract components for the pages

## Code Rules
- All files must use `.tsx` or `.ts` — never `.jsx` or `.js`
- Import all types from `src/types.ts`, never redefine them locally
- Pages must use `useFlashcardsContext()`, never call `useFlashcards()` directly
- All state updates must be immutable (spread, never mutate)
- New operations belong in `useFlashcards.ts`, not inside components
- Pure logic (no React deps) belongs in `src/utils/`, not in hooks or components
- `tsc --noEmit` must pass with zero errors before any change is considered done

## Testing
- Tests live in `src/hooks/useFlashcards.test.ts`
- Use `renderHook` + `act` from `@testing-library/react`
- Every new operation added to the hook needs at least one corresponding test
- Test edge cases: empty state, invalid/missing IDs, no active session

## Do Not
- Install new dependencies without being asked
- Add inline styles — use classNames
- Use `any` types
- Put fetch calls or business logic inside page components
- Duplicate type definitions