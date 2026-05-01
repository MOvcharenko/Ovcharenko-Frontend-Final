# PocketBase Migration — Summary

## ✅ Completed

### 1. Installation & Setup
- ✓ `npm install pocketbase --legacy-peer-deps`
- ✓ Created `src/lib/pocketbase.ts` singleton client
- ✓ Updated `.env` with `VITE_POCKETBASE_URL` placeholder

### 2. API Layer Migration
- ✓ Replaced `src/services/api.ts` to use PocketBase SDK
- ✓ All CRUD operations now call `pb.collection('collectionName').method()`
- ✓ Integrated SM-2 algorithm in `rateCard()` via `computeNextReview()`
- ✓ Removed old Express/fetch request logic

### 3. Store & Dependencies
- ✓ `src/store/flashcardsStore.ts` unchanged (calls API layer)
- ✓ `src/store/authStore.ts` created for optional auth flows
- ✓ Removed local server (`/server` directory deleted)
- ✓ Cleaned up `package.json`: removed `express`, `cors`, `@types/express`, `@types/cors`; kept `pocketbase`

### 4. Configuration
- ✓ `tsconfig.json` updated (removed server reference)
- ✓ `package.json` scripts cleaned (removed `"server"` script)

### 5. Testing
- ✓ All 23 tests passing
- ✓ TypeScript compilation: `tsc --noEmit` passes

---

## 📋 Required Manual Actions

### 1. Set PocketBase URL
**File:** `.env`
Update the placeholder with your actual PocketBase instance URL:
```env
VITE_POCKETBASE_URL=https://your-pocketbase-instance.pockethost.io
```

### 2. Create PocketBase Collections
In your PocketBase admin console, create two collections with these fields:

#### Collection: `decks`
- `id` (auto, primary key)
- `title` (text, required)
- `description` (text)
- `created` (auto datetime)
- `updated` (auto datetime)

#### Collection: `cards`
- `id` (auto, primary key)
- `deckId` (text, required) — link to deck ID
- `front` (text, required)
- `back` (text, required)
- `tags` (JSON array)
- `status` (select: 'new', 'learning', 'review', 'mastered')
- `interval` (number, default: 1)
- `easeFactor` (number, default: 2.5)
- `dueDate` (datetime, required)
- `createdAt` (datetime, required)
- `lastReviewedAt` (datetime, nullable)
- `created` (auto datetime)
- `updated` (auto datetime)

### 3. Set Collection Access Rules
In PocketBase admin console, go to each collection's API Rules tab:
- **If public**: Set rules to `@request.auth.id != "" || @request.method = "get"` (or `true` for full public access)
- **If private**: Keep auth required for all operations

### 4. Add CORS Origin
In PocketBase Admin Console → Settings → Application:
Add your GitHub Pages domain to **Allowed origins**:
```
https://your-username.github.io
```

### 5. Update GitHub Actions (if deploying to Pages)
Add the PocketBase URL as a secret in your GitHub repository:
- Go to **Settings → Secrets and variables → Actions**
- Add: `VITE_POCKETBASE_URL` = `https://your-pocketbase-instance.pockethost.io`
- Update `.github/workflows/*.yml` to inject: `VITE_POCKETBASE_URL: ${{ secrets.VITE_POCKETBASE_URL }}`

---

## 📁 Data Flow (Updated)

```
UI Component
  ↓
Zustand Store (src/store/flashcardsStore.ts)
  ↓
API Layer (src/services/api.ts) — **Now using PocketBase**
  ↓
PocketBase SDK (src/lib/pocketbase.ts)
  ↓
Remote PocketBase Instance (deployed URL)
```

---

## 🔐 Optional: Real-Time Subscriptions

If you want live updates, add this to components:

```tsx
import { pb } from '../lib/pocketbase';

useEffect(() => {
  const unsubscribe = pb.collection('decks').subscribe('*', (e) => {
    // Handle real-time updates: e.action = 'create', 'update', 'delete'
    console.log(e);
  });
  
  return () => unsubscribe();
}, []);
```

---

## 🚀 Next Steps

1. Deploy PocketBase (e.g., PocketHost, Railway, etc.)
2. Configure collections and rules in admin console
3. Update `.env` with your instance URL
4. Set GitHub Actions secrets if deploying to Pages
5. Test locally: `npm run dev`
6. Build & deploy: `npm run build`

All tests passing ✓ TypeScript strict mode ✓
