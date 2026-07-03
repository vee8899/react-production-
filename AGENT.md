# AGENT.md — Client Automation Dashboard

This file instructs an autonomous coding agent on the architecture, conventions, and implementation expectations for this project. Read this before touching any file.

## Instruction Heuristics

- Treat the markdown files as a ranked set of signals, not as a flat pile of equal instructions.
- Prefer the newest, most specific doc for the surface you are editing.
- If two docs conflict, do not guess. Read the surrounding files, identify the latest intent, and preserve the current working state unless the user explicitly asks for a rollback.
- Do not undo unrelated user changes while following a doc. If a diagnostic doc suggests a fix that would revert newer product work, pause and reconcile the conflict first.
- Verify against the current codebase before editing; do not assume the document is complete or current.
- When a doc describes a pattern with an exact code sample, follow the pattern only if it still matches the active app structure.
- Active guidance lives here, in `UI.md`, `DASHBOARD.md`, and `DEBUG.md`. Older one-off spec notes are intentionally archived or deleted.

---

## Product

A client-facing dashboard that lets clients view analytics on their automated data pipelines. Automations run in **n8n**, write results to **Supabase**, and clients log in to see what ran, when, how many records were processed, and whether anything failed.

**Two distinct surfaces:**

| Surface | Who sees it | What it does |
|---|---|---|
| Public landing page | Anyone | Marketing/studio aesthetic, login entry point |
| Private dashboard | Authenticated clients only | Automation analytics, workflow status |

---

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| UI framework | React | 18+ |
| Language | TypeScript | 5+ (strict mode) |
| Build tool | Vite | 5+ |
| Styling | Tailwind CSS | 3+ |
| Animation | Framer Motion | 11+ |
| Backend/DB | Supabase | JS SDK v2 |
| Workflow engine | n8n Cloud | REST / Webhook |
| Routing | React Router | v6 |
| State | Zustand | 4+ |
| Data fetching | TanStack Query | v5 |
| Forms | React Hook Form + Zod | latest |
| Testing | Vitest + Testing Library | latest |

---

## Directory Structure

```
src/
├── api/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client singleton
│   │   ├── auth.ts                 # signIn, signOut, getSession
│   │   ├── clients.ts              # query client profile
│   │   ├── workflows.ts            # query workflow registry
│   │   ├── runs.ts                 # query automation_runs
│   │   └── analytics.ts           # query analytics_snapshots
│   └── n8n/
│       ├── client.ts               # base fetch wrapper (calls Edge Function proxy)
│       ├── webhooks.ts             # webhook trigger functions
│       └── workflows.ts            # workflow list/activate via proxy
├── components/
│   ├── ui/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── SectionHeader.tsx
│   │   └── Cursor.tsx
│   ├── motion/
│   │   ├── FadeUp.tsx
│   │   └── PageTransition.tsx
│   └── dashboard/
│       ├── StatsRow.tsx            # key metrics in large mono numbers
│       ├── RunsTable.tsx           # recent automation runs list
│       ├── WorkflowCard.tsx        # single workflow status row
│       └── StatusDot.tsx          # green/muted active indicator
├── hooks/
│   ├── useAuth.ts
│   ├── useClient.ts               # fetch the authed user's client row
│   ├── useRuns.ts                 # fetch automation_runs with filters
│   ├── useAnalytics.ts            # fetch analytics_snapshots
│   └── useN8nWebhook.ts
├── pages/
│   ├── HomePage.tsx               # public landing page
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx          # analytics overview (protected)
│   └── WorkflowsPage.tsx          # workflow list + status (protected)
├── store/
│   └── authStore.ts
├── types/
│   ├── supabase.ts                # auto-generated — do not edit manually
│   └── n8n.ts
├── utils/
│   └── env.ts
├── App.tsx
└── main.tsx

supabase/
├── migrations/
│   └── 20260628000001_initial_schema.sql
└── functions/
    └── n8n-proxy/
        └── index.ts               # Edge Function — proxies n8n REST API calls
```

---

## Data Model

### `clients`
One row per client. Created when a user account is set up.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| email | text | |
| company_name | text | |
| plan | text | starter / growth / enterprise |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated via trigger |

### `workflows`
Registry of n8n workflows assigned to each client.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | FK → clients |
| n8n_workflow_id | text | ID from n8n cloud |
| name | text | |
| description | text | nullable |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `automation_runs`
Written by n8n at the end of every workflow execution via HTTP Request node → Supabase Edge Function.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | FK → clients |
| workflow_id | uuid | FK → workflows, nullable |
| n8n_workflow_id | text | denormalized for direct n8n writes |
| workflow_name | text | |
| status | text | success / error / partial |
| records_processed | integer | |
| records_failed | integer | |
| duration_ms | integer | nullable |
| error_message | text | null if success |
| metadata | jsonb | any extra n8n payload |
| ran_at | timestamptz | |

### `analytics_snapshots`
Daily rollups per client. Refreshed by a scheduled n8n workflow so the dashboard doesn't aggregate on every page load.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | FK → clients |
| snapshot_date | date | unique per client per day |
| total_runs | integer | |
| successful_runs | integer | |
| failed_runs | integer | |
| total_records | integer | |
| avg_duration_ms | integer | nullable |
| created_at | timestamptz | |

---

## How n8n Writes to Supabase

At the end of every n8n workflow, add an **HTTP Request node**:

```
Method: POST
URL: https://your-project.supabase.co/functions/v1/ingest-run
Headers:
  Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
  Content-Type: application/json
Body:
{
  "client_id": "{{ $vars.CLIENT_ID }}",
  "n8n_workflow_id": "{{ $workflow.id }}",
  "workflow_name": "{{ $workflow.name }}",
  "status": "success",
  "records_processed": {{ $json.totalRecords }},
  "records_failed": 0,
  "duration_ms": {{ $execution.resumeUrl }},
  "metadata": {{ $json }}
}
```

The Edge Function `ingest-run` receives this and writes to `automation_runs` using the service role key (never exposed client-side).

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_N8N_BASE_URL=https://your-instance.n8n.cloud
VITE_N8N_API_KEY=your-n8n-api-key   # only used in Edge Function, not client
```

Access only through `src/utils/env.ts`. Never inline env vars.

---

## Supabase Setup

### Client singleton

```ts
// src/api/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { env } from "@/utils/env";

export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey
);
```

### Generate types after running migration

```bash
npx supabase gen types typescript \
  --project-id your-project-id \
  --schema public \
  > src/types/supabase.ts
```

Re-run whenever the schema changes.

### Key queries

```ts
// src/api/supabase/runs.ts
import { supabase } from "./client";

export const getRecentRuns = async (clientId: string, limit = 20) => {
  const { data, error } = await supabase
    .from("automation_runs")
    .select("*")
    .eq("client_id", clientId)
    .order("ran_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getRunStats = async (clientId: string) => {
  const { data, error } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .eq("client_id", clientId)
    .order("snapshot_date", { ascending: false })
    .limit(30);

  if (error) throw error;
  return data;
};
```

---

## n8n Integration

### Security rule
- **Webhook triggers**: called directly from the client, no key needed
- **n8n REST API** (list/activate workflows): must go through the `n8n-proxy` Supabase Edge Function — never call n8n Cloud API directly from client code
- **Writing runs to Supabase**: n8n calls the `ingest-run` Edge Function using the service role key stored as an n8n credential

### Edge Function: n8n-proxy

```ts
// supabase/functions/n8n-proxy/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { path, method, body } = await req.json();

  const res = await fetch(`https://api.n8n.cloud/api/v1${path}`, {
    method,
    headers: {
      "X-N8N-API-KEY": Deno.env.get("N8N_API_KEY")!,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Edge Function: ingest-run

```ts
// supabase/functions/ingest-run/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const payload = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase
    .from("automation_runs")
    .insert(payload);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
```

---

## Dashboard Page Spec

### Stats row — top of dashboard
Four metrics pulled from the most recent `analytics_snapshots` rows:

| Metric | Source |
|---|---|
| Total runs (30d) | sum of `total_runs` last 30 snapshots |
| Success rate | `successful_runs / total_runs * 100` |
| Records processed | sum of `total_records` last 30 snapshots |
| Avg duration | avg of `avg_duration_ms` last 30 snapshots |

Display as large mono numbers with small label beneath. No charts on this row.

### Recent runs table
Columns: workflow name, status dot, records processed, duration, ran at (relative time).
Paginate at 20 rows. Filter by status (all / success / error).

### No charts yet
Add charting (TanStack/Recharts) only after the data pipeline is confirmed working end-to-end.

---

## Workflows Page Spec

Each workflow is a full-width row:

```
[status dot]  Workflow Name          Last run: 2 hours ago    [Active / Inactive]
              Short description      423 records · 1.2s
──────────────────────────────────────────────────────────────────────────────────
```

Clicking a row expands inline to show the last 5 runs for that workflow. No modals.

---

## Routing & Auth Guard

```tsx
// Protected routes redirect to /login if no session
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
<Route path="/workflows" element={<ProtectedRoute><WorkflowsPage /></ProtectedRoute>} />
```

Nav should show Dashboard/Workflows links only when authenticated.

---

## TypeScript Rules

- `strict: true` — no exceptions
- No `any`. Use `unknown` and narrow
- All Supabase queries typed via generated `Database` type
- Use `satisfies` for config objects

---

## Code Style

- Functional components only
- `export default` for pages, named exports for everything else
- No `useEffect` for data fetching — use TanStack Query
- Co-locate types with the file that owns them unless shared

---

## Error Handling

- Supabase returns `{ data, error }` — always check `error` before using `data`
- n8n errors caught at hook level, surfaced via component state
- Empty states are meaningful: "No runs yet" tells the client their workflows haven't executed, not that something broke

---

## Running the Migration

```bash
# Push migration to your Supabase project
npx supabase db push

# Or paste the SQL directly into the Supabase SQL editor
# supabase/migrations/20260628000001_initial_schema.sql

# Then generate types
npx supabase gen types typescript \
  --project-id your-project-id > src/types/supabase.ts
```

---

## Next Steps (in order)

1. Run the migration in Supabase
2. Generate TypeScript types
3. Wire up Supabase auth on the login page
4. Build the `useClient` hook to fetch the authed client row
5. Build the dashboard with real data from `analytics_snapshots`
6. Build the workflows page with real data from `workflows` + `automation_runs`
7. Deploy the `ingest-run` Edge Function
8. Add the HTTP Request node to n8n workflows to write run data
9. Deploy the `n8n-proxy` Edge Function
10. Test end-to-end: trigger n8n → check Supabase → confirm dashboard updates
