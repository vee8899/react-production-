# DEBUG.md — Auth & Sign Out Issues

This file instructs the agent to systematically debug and fix the sign out functionality. Follow every step in order without skipping.

## Heuristics For Future Runs

- Treat this file as a targeted debugging playbook, not a blanket instruction to revert the app to an earlier state.
- If a step conflicts with newer product or UI docs, keep the newer product intent and adapt the debug fix around it.
- Confirm the current symptom before applying a fix; this file is useful when the bug is still present, not as a reason to reapply a resolved change.
- Prefer minimal, scoped edits that preserve the current app surface unless the user explicitly requests a rollback.
- When a diagnostic file says "rewrite from scratch", verify that the exact code still matches the current architecture before copying it.

---

## Problem Summary

1. Sign out button appears then disappears after edits
2. After signing out the app does not redirect
3. Nav re-renders excessively (session logged 20+ times)
4. Auth state is inconsistent across components

---

## Step 1 — Audit Every Auth-Related File

Read and report the current contents of these files before changing anything:

- `src/store/authStore.ts`
- `src/hooks/useAuth.ts`
- `src/api/supabase/auth.ts`
- `src/api/supabase/client.ts`
- `src/components/ui/Nav.tsx`
- `src/main.tsx`
- `src/App.tsx`

Do not edit anything yet. Just read and report what each file contains.

---

## Step 2 — Rewrite authStore.ts From Scratch

Replace the entire file with exactly this:

```ts
// src/store/authStore.ts
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

---

## Step 3 — Rewrite useAuth.ts From Scratch

Replace the entire file with exactly this:

```ts
// src/hooks/useAuth.ts
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/api/supabase/client';

export const useAuth = () => {
  const { session, isLoading, setSession } = useAuthStore();

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    window.location.href = '/';
  };

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading,
    signOut,
  };
};
```

---

## Step 4 — Rewrite main.tsx Auth Bootstrap

In main.tsx, make sure the Supabase auth listener is set up before React renders. Replace or update the auth bootstrap section with exactly this pattern:

```ts
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { supabase } from './api/supabase/client';
import { useAuthStore } from './store/authStore';
import './styles/globals.css';

// Bootstrap auth before rendering
const { setSession, setLoading } = useAuthStore.getState();

supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  setLoading(false);
});

supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
  setLoading(false);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Step 5 — Rewrite ProtectedRoute in App.tsx

Update the ProtectedRoute component to handle the loading state so it never redirects before auth is confirmed:

```tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null; // wait for auth to resolve
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};
```

---

## Step 6 — Rewrite the Sign Out Button in Nav.tsx

Find the nav links section in Nav.tsx and add the sign out button using exactly this pattern — do not use useNavigate, use window.location.href instead:

```tsx
// Inside Nav.tsx
import { useAuth } from '@/hooks/useAuth';

// Inside the component:
const { isAuthenticated, signOut } = useAuth();

// Inside the JSX, at the end of the nav links:
{isAuthenticated && (
  <button
    onClick={signOut}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontFamily: 'inherit',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#0F0E0D',
      padding: 0,
    }}
  >
    Sign Out
  </button>
)}
```

Do not use Tailwind classes for this button — use inline styles to avoid any class conflicts.

---

## Step 7 — Remove All Debug Logs

Search every file in src/ for console.log statements and remove all of them.

```bash
# Run this to find them all
grep -r "console.log" src/
```

Remove every result.

---

## Step 8 — Verify

After all changes are made:

1. Run `npm run dev`
2. Confirm the app loads at localhost:5173
3. Confirm the login page renders correctly
4. Log in with valid credentials
5. Confirm the dashboard loads with the sign out button visible in the nav
6. Click sign out
7. Confirm it redirects to the homepage and the sign out button disappears
8. Confirm the dashboard is no longer accessible without logging in again

Report the result of each step.

---

## What NOT To Do

- Do not add new dependencies
- Do not change any styling on any page
- Do not refactor anything outside of the files listed above
- Do not use useNavigate for the sign out redirect — use window.location.href
- Do not add console.log statements
- Do not skip steps
