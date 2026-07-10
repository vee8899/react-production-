# DEBUG.md

Use this file when auth or navigation behavior breaks.

## Known debug areas

- `src/hooks/useAuth.ts`
- `src/store/authStore.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/ui/Nav.tsx`

## Current auth flow

- Auth session is bootstrapped before render.
- `ProtectedRoute` waits for auth loading to finish.
- Sign out clears local session state and returns to `/`.

## Debug rules

- Verify the symptom in the current code before changing anything.
- Keep fixes scoped to the broken behavior.
- Do not use this file to roll the app back to an earlier shape.
- If a change would conflict with the current landing page or dashboard behavior, preserve the newer behavior and adjust the fix.

## What to check first

1. `src/main.tsx` for auth bootstrap.
2. `src/hooks/useAuth.ts` for session and redirect behavior.
3. `src/components/ui/Nav.tsx` for link visibility and contact links.
4. `src/App.tsx` for router and route guard structure.
