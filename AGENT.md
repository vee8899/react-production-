# AGENT.md

This repo is a React + TypeScript Vite app for a client automation studio.

## Current shape

- Public site: landing page with studio-style content and contact/login entry points.
- Private site: protected dashboard and workflows views for authenticated clients.
- Auth state: Supabase session is bootstrapped in `src/main.tsx` and stored in Zustand.
- Routing: `src/App.tsx` owns the app routes and the `ProtectedRoute` guard.
- Data: dashboard/workflows pages read from Supabase via React Query hooks.

## Working rules

- Treat the codebase as the source of truth. Verify the current implementation before editing.
- Prefer the existing patterns in `src/` over importing new architecture from old markdown notes.
- Make the smallest change that fits the current repo state.
- Do not revert unrelated user changes.
- If a doc or comment conflicts with the code, follow the code and update the doc.

## Important files

- `src/main.tsx`
- `src/App.tsx`
- `src/hooks/useAuth.ts`
- `src/store/authStore.ts`
- `src/components/ui/Nav.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/WorkflowsPage.tsx`
- `src/styles/globals.css`

## Environment

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Access env through `src/utils/env.ts`.
