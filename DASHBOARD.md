# DASHBOARD.md — Real Data Connection & Login Button

Read this alongside AGENT.md and UI.md before touching any file.

---

## Objectives

1. Connect the dashboard to real Supabase data
2. Connect the workflows page to real Supabase data  
3. Add a Client Login button to the public nav
4. Ensure all stats, charts, and activity feeds show live data

---

## Part 1 — Nav Login Button

### What to build

Add a "Client Login" link to the public nav that appears only when the user is NOT authenticated.

### Exact spec

In `Nav.tsx`:

```tsx
// Public nav — show when NOT authenticated
{!isAuthenticated && (
  <a
    href="/login"
    style={{
      fontSize: '0.75rem',
      fontFamily: 'inherit',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#0F0E0D',
      textDecoration: 'none',
    }}
  >
    Client Login
  </a>
)}

// Private nav — show when authenticated
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

### Nav link visibility rules

| Link | Public (not logged in) | Private (logged in) |
|---|---|---|
| Work | ✅ | ✅ |
| Services | ✅ | ✅ |
| Contact | ✅ | ✅ |
| Dashboard | ❌ | ✅ |
| Workflows | ❌ | ✅ |
| Client Login | ✅ | ❌ |
| Sign Out | ❌ | ✅ |

---

## Part 2 — Dashboard Page Real Data

### Data sources

All data comes from Supabase. Use TanStack Query (`useQuery`) for every fetch.

### Step 1 — Fetch the client row

```ts
// src/hooks/useClient.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useClient = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
};
```

### Step 2 — Fetch recent automation runs

```ts
// src/hooks/useRuns.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export const useRuns = (clientId: string | undefined, limit = 20) => {
  return useQuery({
    queryKey: ['runs', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_runs')
        .select('*')
        .eq('client_id', clientId!)
        .order('ran_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};
```

### Step 3 — Fetch analytics snapshots

```ts
// src/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export const useAnalytics = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['analytics', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('client_id', clientId!)
        .order('snapshot_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    },
  });
};
```

### Step 4 — Dashboard stats row

Replace hardcoded numbers with computed values from real data:

```tsx
// src/components/dashboard/StatsRow.tsx
import { useClient } from '@/hooks/useClient';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRuns } from '@/hooks/useRuns';

export const StatsRow = () => {
  const { data: client } = useClient();
  const { data: snapshots } = useAnalytics(client?.id);
  const { data: runs } = useRuns(client?.id);

  // Compute stats from real data
  const totalRuns = snapshots?.reduce((sum, s) => sum + s.total_runs, 0) ?? 0;
  const totalRecords = snapshots?.reduce((sum, s) => sum + s.total_records, 0) ?? 0;
  const successRate = snapshots && snapshots.length > 0
    ? Math.round(
        (snapshots.reduce((sum, s) => sum + s.successful_runs, 0) /
          snapshots.reduce((sum, s) => sum + s.total_runs, 0)) * 100
      )
    : 0;
  const avgDuration = snapshots && snapshots.length > 0
    ? Math.round(
        snapshots.reduce((sum, s) => sum + (s.avg_duration_ms ?? 0), 0) /
          snapshots.length / 1000
      )
    : 0;

  const stats = [
    { value: totalRuns.toLocaleString(), label: 'Workflows Run' },
    { value: `${successRate}%`, label: 'Success Rate' },
    { value: totalRecords.toLocaleString(), label: 'Records Processed' },
    { value: `${avgDuration}s`, label: 'Avg. Duration' },
  ];

  return (
    <div className="stats-row">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-item">
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
```

### Step 5 — Recent runs feed

Replace hardcoded activity items with real `automation_runs` rows:

```tsx
// src/components/dashboard/RunsFeed.tsx
import { useClient } from '@/hooks/useClient';
import { useRuns } from '@/hooks/useRuns';

const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day ago`;
};

export const RunsFeed = () => {
  const { data: client } = useClient();
  const { data: runs, isLoading } = useRuns(client?.id, 10);

  if (isLoading) return <div className="loading">Loading...</div>;

  if (!runs || runs.length === 0) {
    return (
      <div className="empty-state">
        No automation runs yet. Workflows will appear here once they execute.
      </div>
    );
  }

  return (
    <div className="runs-feed">
      {runs.map((run) => (
        <div key={run.id} className="run-item">
          <div className="run-info">
            <span className="run-name">{run.workflow_name}</span>
            <span className="run-meta">
              {run.records_processed} records · {run.status}
            </span>
          </div>
          <span className="run-time">{formatRelativeTime(run.ran_at)}</span>
        </div>
      ))}
    </div>
  );
};
```

---

## Part 3 — Workflows Page Real Data

### Fetch workflows with latest run

```ts
// src/hooks/useWorkflows.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export const useWorkflows = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['workflows', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          automation_runs (
            status,
            ran_at,
            records_processed,
            duration_ms
          )
        `)
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
```

### Workflow row component

```tsx
// src/components/dashboard/WorkflowRow.tsx
type WorkflowRowProps = {
  name: string;
  description: string | null;
  isActive: boolean;
  lastRun: {
    status: string;
    ran_at: string;
    records_processed: number;
    duration_ms: number | null;
  } | null;
};

export const WorkflowRow = ({ name, description, isActive, lastRun }: WorkflowRowProps) => {
  const lastRunTime = lastRun
    ? formatRelativeTime(lastRun.ran_at)
    : 'Never run';

  const recordsInfo = lastRun
    ? `${lastRun.records_processed} records · ${((lastRun.duration_ms ?? 0) / 1000).toFixed(1)}s`
    : '—';

  return (
    <div className="workflow-row">
      <div className="workflow-left">
        <div
          className="status-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isActive ? '#22C55E' : '#6B6762',
            flexShrink: 0,
          }}
        />
        <div className="workflow-info">
          <span className="workflow-name">{name}</span>
          {description && (
            <span className="workflow-desc">{description}</span>
          )}
          <span className="workflow-meta">{recordsInfo}</span>
        </div>
      </div>
      <span className="workflow-time">{lastRunTime}</span>
    </div>
  );
};
```

---

## Part 4 — Loading & Empty States

Every data-dependent section must handle three states:

### Loading state
```tsx
if (isLoading) {
  return (
    <div style={{ color: '#6B6762', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
      LOADING...
    </div>
  );
}
```

### Empty state
```tsx
if (!data || data.length === 0) {
  return (
    <div style={{ color: '#6B6762', fontSize: '1rem' }}>
      No data yet. Automations will appear here once workflows run.
    </div>
  );
}
```

### Error state
```tsx
if (error) {
  return (
    <div style={{ color: '#6B6762', fontSize: '0.75rem' }}>
      Failed to load data. Please refresh.
    </div>
  );
}
```

---

## Cline Prompt

Paste this into Cline after it reads this file:

```
Read DASHBOARD.md, AGENT.md, and UI.md.

Make the following changes in this exact order:

1. Update Nav.tsx:
   - Show "Client Login" link when NOT authenticated, linking to /login
   - Show "Dashboard" and "Workflows" links ONLY when authenticated
   - Show "Sign Out" button ONLY when authenticated
   - Use inline styles for the Client Login link and Sign Out button
     exactly as specified in DASHBOARD.md

2. Create these hooks exactly as written in DASHBOARD.md:
   - src/hooks/useClient.ts
   - src/hooks/useRuns.ts
   - src/hooks/useAnalytics.ts
   - src/hooks/useWorkflows.ts

3. Update DashboardPage.tsx:
   - Replace all hardcoded stats with StatsRow component using real data
   - Replace all hardcoded activity items with RunsFeed component
   - Use useClient to get the client row first, then pass client.id 
     to other hooks
   - Show loading and empty states as specified in DASHBOARD.md

4. Update WorkflowsPage.tsx:
   - Replace all hardcoded workflow rows with real data from useWorkflows
   - Show status dot (green if active, muted if inactive)
   - Show last run time and records processed per workflow
   - Show loading and empty states

5. Do not change any styling, fonts, colors, spacing, or animations
   on any page. Only update the data layer and nav visibility rules.

Test by checking that the dashboard shows real numbers from 
the automation_runs and analytics_snapshots tables in Supabase.
```

---

## Verification Checklist

After Cline finishes, confirm each item:

- [ ] Homepage shows "Client Login" in nav when not logged in
- [ ] Clicking "Client Login" goes to `/login`
- [ ] After login, nav shows Dashboard, Workflows, Sign Out
- [ ] Dashboard stats show real numbers from `analytics_snapshots`
- [ ] Recent runs feed shows real rows from `automation_runs`
- [ ] Workflows page shows real rows from `workflows` table
- [ ] Status dots are green for active workflows, muted for inactive
- [ ] Empty state shows when no data exists
- [ ] Loading state shows while data is fetching
- [ ] Sign out works and redirects to homepage
