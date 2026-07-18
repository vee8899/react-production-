import { Link } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import { useRunDetails } from "@/hooks/useRunDetails";
import { getServiceLabel } from "@/lib/serviceCatalog";

const statusLabels = { success: "Success", partial: "Partial", error: "Failed" } as const;
const statusColors = { success: "#6B8F7A", partial: "#A66A00", error: "#A13A32" } as const;

const formatDateTime = (value: string | null) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "Not recorded";

const formatDuration = (durationMs: number | null) =>
  durationMs === null ? "Not recorded" : `${(durationMs / 1000).toFixed(1)}s`;

export const RunDetail = ({ runId }: { runId: string }) => {
  const { data: client } = useClient();
  const { data: run, isLoading, error } = useRunDetails(runId, client?.organization_id);

  if (isLoading) return <p className="text-label uppercase tracking-[0.08em] text-muted">Loading run detail...</p>;
  if (error) return <p className="text-label uppercase tracking-[0.08em] text-muted">Run detail is unavailable. Please refresh.</p>;
  if (!run) return <p className="text-label uppercase tracking-[0.08em] text-muted">This run could not be found.</p>;

  const statusColor = statusColors[run.status];
  const statusLabel = statusLabels[run.status];
  const summaryStats = [
    ["Started", formatDateTime(run.startedAt)],
    ["Finished", formatDateTime(run.finishedAt)],
    ["Duration", formatDuration(run.durationMs)],
    ["Retries", String(run.retries)],
    ["Processed", String(run.recordsProcessed)],
    ["Failed records", String(run.recordsFailed)],
    ["Event reference", run.eventId],
    ["Correlation", run.correlationId ?? "Not recorded"],
  ];

  return (
    <article className="mt-8 max-w-4xl border border-border bg-background p-5 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">{getServiceLabel(run.featureKey)}</p>
          <h2 className="mt-2 font-display text-3xl text-primary">{run.workflowName}</h2>
          <p className="mt-2 text-label font-mono uppercase tracking-[0.05em] text-muted">Run reference: {run.id}</p>
        </div>
        <span className="font-mono text-sm uppercase tracking-[0.08em]" style={{ color: statusColor }}>{statusLabel}</span>
      </div>

      <div className="mt-6 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map(([label, value]) => (
          <div key={label} className="bg-surface p-4">
            <p className="text-label font-mono uppercase tracking-[0.06em] text-muted">{label}</p>
            <p className="mt-2 break-words font-mono text-sm text-primary">{value}</p>
          </div>
        ))}
      </div>

      {(run.status !== "success" || run.errorMessage) && (
        <section className="mt-8 border-t border-border pt-6">
          <p className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: statusColor }}>Investigation note</p>
          <p className="mt-3 text-sm font-light leading-relaxed text-muted">
            {run.errorMessage ?? "No additional failure detail was reported for this run."}
          </p>
        </section>
      )}

      <section className="mt-8 border-t border-border pt-6">
        <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Execution steps</p>
        {run.steps.length === 0 ? (
          <p className="mt-4 text-sm font-light text-muted">No step-level detail was recorded for this run.</p>
        ) : (
          <div className="mt-4 space-y-0">
            {run.steps.map((step) => (
              <div key={step.id} className="border-b border-border py-4 last:border-b-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-sans text-primary">{step.stepName}</p>
                    <p className="mt-1 text-label font-mono uppercase tracking-[0.05em] text-muted">
                      {step.status} · attempt {step.attempt} · {formatDuration(step.durationMs)}
                    </p>
                  </div>
                  {step.errorMessage && <p className="max-w-xl text-sm font-light leading-relaxed" style={{ color: "#A13A32" }}>{step.errorMessage}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Affected records</p>
        {run.entitySummaries.length === 0 ? (
          <p className="mt-4 text-sm font-light text-muted">No affected entity references were recorded for this run.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {run.entitySummaries.map((summary) => (
              <div key={`${summary.entityType}-${summary.action}-${summary.sourceSystem}`} className="border border-border p-3">
                <p className="font-mono text-sm uppercase text-primary">{summary.count} {summary.entityType}</p>
                <p className="mt-1 text-label font-mono uppercase tracking-[0.05em] text-muted">{summary.action} · {summary.sourceSystem}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-8 border-t border-border pt-5 text-sm font-light leading-relaxed text-muted">
        If this run needs attention, share the run reference with your workflow operator.
      </p>
      <Link to="/activity" className="mt-5 inline-block text-label font-mono uppercase tracking-[0.08em] text-muted hover:text-primary">
        ← Back to activity
      </Link>
    </article>
  );
};
