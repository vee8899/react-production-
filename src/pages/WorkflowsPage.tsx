import { useClient } from "@/hooks/useClient";
import { useWorkflows } from "@/hooks/useWorkflows";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { WorkflowRow } from "@/components/dashboard/WorkflowRow";

export default function WorkflowsPage() {
  const { data: client, isLoading: clientLoading, error: clientError } = useClient();
  const { data: workflows, isLoading: workflowsLoading, error: workflowsError } = useWorkflows(client?.id);

  const isLoading = clientLoading || workflowsLoading;

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 — Workflows" />
          <div style={{ color: '#6B6762', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
            LOADING...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (clientError || workflowsError) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 — Workflows" />
          <div style={{ color: '#6B6762', fontSize: '0.75rem' }}>
            Failed to load data. Please refresh.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Empty state (no client) ───────────────────────────────────────
  if (!client) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 — Workflows" />
          <div style={{ color: '#6B6762', fontSize: '1rem' }}>
            No data yet. Automations will appear here once workflows run.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Empty state (no workflows) ────────────────────────────────────
  if (!workflows || workflows.length === 0) {
    return (
      <>
        <Nav />
        <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
          <SectionHeader label="01 — Workflows" />
          <div style={{ color: '#6B6762', fontSize: '1rem' }}>
            No data yet. Automations will appear here once workflows run.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Data state ────────────────────────────────────────────────────
  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="01 — Workflows" />

        <div className="mt-12 space-y-0">
          {workflows.map((wf) => {
            const latestRun = wf.automation_runs?.[0] ?? null;
            return (
              <WorkflowRow
                key={wf.id}
                name={wf.name}
                description={wf.description}
                isActive={wf.is_active}
                lastRun={
                  latestRun
                    ? {
                        status: latestRun.status,
                        ran_at: latestRun.ran_at,
                        records_processed: latestRun.records_processed,
                        duration_ms: latestRun.duration_ms,
                      }
                    : null
                }
              />
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}