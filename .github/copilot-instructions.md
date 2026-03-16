# FlashFlow — Copilot Instructions

## Project Overview
A Study Flashcard System built with React, TypeScript, and Vite.
Features spaced repetition (SM-2 algorithm), deck/card CRUD, and study sessions.
State is managed via a Zustand store with `persist` middleware for localStorage.
All network operations are abstracted through a typed service layer in `src/services/api.ts`.

## Tech Stack
- React 18 + TypeScript (strict mode)
- React Router v6
- Vite
- Zustand with `persist` middleware (state + localStorage)
- Vitest + @testing-library/react for tests
- No external UI libraries — plain className-based styling

## Architecture
- `src/types.ts` — single source of truth for all types; always import from here
- `src/store/flashcardsStore.ts` — Zustand store: all state, all actions, persist middleware
- `src/hooks/useFlashcards.ts` — thin wrapper around the store; selects and exposes state/actions to components
- `src/context/FlashcardsContext.tsx` — distributes the hook output to all pages via React Context
- `src/services/api.ts` — all network calls live here; store actions call these, never fetch directly
- `src/utils/srs.ts` — pure SM-2 logic, zero React dependencies, independently testable
- `src/utils/storage.ts` — localStorage helpers used by persist middleware
- `src/pages/` — page components; always consume state via `useFlashcardsContext()`
- `src/components/` — reusable UI components composed by pages
- `server/` — local Express backend used for persistence; includes API routes, storage helper, and file-backed data store

## Data Flow
All state changes follow this strict pipeline:

```
UI Event (component)
  → store action (flashcardsStore.ts)
    → [if async] api service call (services/api.ts)
      → setLoading(true) before, setLoading(false) after
      → setError(response.error) if response.error is non-null
      → set(...) with server-returned data on success
  → persist middleware writes updated state to localStorage
  → Zustand notifies subscribers → components re-render
```

Never skip a layer. A component should never call `fetch` directly. A store action
should never call `fetch` directly — it must go through `api.ts`.

## Error Handling Convention
All API functions return `ApiResponse<T>` defined as `{ data: T | null; error: string | null }`.

Store actions that call the API must follow this pattern:
```ts
async exampleAction(id: string) {
  set({ loading: true, error: null });
  const response = await someApi.someMethod(id);
  if (response.error) {
    set({ loading: false, error: response.error });
    return;
  }
  set(state => ({
    loading: false,
    // merge response.data into state here
  }));
}
```

Never swallow errors silently. Always call `setError()` on failure and `setLoading(false)` in both branches.

## State Shape Rules
- `decks` embeds `cards` arrays — do not create a separate flat `cards` collection
- `activeSession` is excluded from persistence via `partialize` — it is transient client-only state
- `loading` and `error` are top-level store fields for async operation feedback
- Never merge `activeSession` into a deck object — sessions are overlays on decks, not properties of them

## Code Rules
- All files must use `.tsx` or `.ts` — never `.jsx` or `.js`
- Import all types from `src/types.ts`, never redefine them locally
- Pages use `useFlashcardsContext()` — never call `useFlashcards()` or the store directly in pages
- All state updates must be immutable (spread syntax, never mutate in place)
- New state operations belong in `flashcardsStore.ts` — never in components, hooks, or pages
- The wrapper hook `useFlashcards.ts` selects from the store; keep it thin, no logic
- Pure utility logic (no React deps) belongs in `src/utils/`
- `tsc --noEmit` must pass with zero errors before any change is considered complete

## Adding a New Feature — Checklist
When adding any new operation (e.g. a new CRUD action or query):

1. Add or update the relevant type in `src/types.ts` if the data shape changes
2. Add the API method signature and placeholder to `src/services/api.ts`
3. Implement the store action in `flashcardsStore.ts`, calling the api service
4. Expose it through the wrapper hook in `useFlashcards.ts` if pages need it
5. Write at least one test in `useFlashcards.test.ts` covering the happy path
6. Write at least one edge case test (empty state, missing ID, no active session)
7. Run `tsc --noEmit` and `npm run test` — both must pass before committing

## Testing
- Tests live in `src/hooks/useFlashcards.test.ts`
- Use `renderHook` + `act` from `@testing-library/react`
- `beforeEach` must clear localStorage and reset store state for isolation
- Every new store operation needs at least one test
- Always test edge cases: empty state, invalid/missing IDs, no active session
- Never test implementation details — test observable state and return values only

## Do Not
- Call `fetch` directly in store actions or components — always go through `src/services/api.ts`
- Install new dependencies without being asked
- Add inline styles — use classNames only
- Use `any` types anywhere
- Put business logic or API calls inside page components
- Redefine types that already exist in `src/types.ts`
- Mutate state directly — always return new objects via spread
- Add logic to `useFlashcards.ts` — it is a selector wrapper only