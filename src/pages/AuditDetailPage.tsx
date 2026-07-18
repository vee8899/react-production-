import { Link, useParams } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
import { useAuditEvent } from "@/hooks/useAuditLog";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";

const formatDateTime = (value: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "long",
}).format(new Date(value));

const formatJson = (value: unknown) => value === null || value === undefined
  ? "Not recorded"
  : JSON.stringify(value, null, 2);

export default function AuditDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: client, isLoading: clientLoading, error: clientError } = useClient();
  const { data: event, isLoading, error } = useAuditEvent(client?.organization_id, eventId);

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="01 - Audit Event" />
        {clientLoading || isLoading ? <p className="text-label uppercase tracking-[0.08em] text-muted">Loading audit event...</p> : null}
        {(clientError || error) && <p className="text-label uppercase tracking-[0.08em] text-muted">This audit event is unavailable. Please refresh.</p>}
        {!clientLoading && !clientError && !isLoading && !error && !client && <p className="text-label uppercase tracking-[0.08em] text-muted">No client workspace found.</p>}
        {!clientLoading && !clientError && !isLoading && !error && client && !event && <p className="text-label uppercase tracking-[0.08em] text-muted">This audit event could not be found.</p>}
        {!clientLoading && !clientError && !isLoading && !error && event && (
          <article className="mt-12 max-w-4xl border border-border bg-background p-5 sm:p-8">
            <p className="mb-6 max-w-2xl text-sm font-light leading-relaxed text-muted">
              Read-only record of a business-object or workflow change. Execution timing and step diagnostics remain on the related workflow run.
            </p>
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">{event.entityType}</p>
                <h1 className="mt-2 font-display text-3xl font-normal text-primary">{event.action.replaceAll("_", " ")}</h1>
                <p className="mt-2 break-all text-label font-mono uppercase tracking-[0.05em] text-muted">Event reference: {event.id}</p>
              </div>
              <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">{formatDateTime(event.createdAt)}</span>
            </div>

            <div className="mt-6 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Actor", event.actorType],
                ["Actor reference", event.actorId ?? "Not recorded"],
                ["Entity reference", event.entityId ?? "Not recorded"],
                ["Workflow", event.workflowName ?? "Not recorded"],
                ["Request reference", event.requestId ?? "Not recorded"],
                ["Workflow reference", event.workflowId ?? "Not recorded"],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface p-4">
                  <p className="text-label font-mono uppercase tracking-[0.06em] text-muted">{label}</p>
                  <p className="mt-2 break-all font-mono text-sm text-primary">{value}</p>
                </div>
              ))}
            </div>

            {event.runId && (
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Related execution</p>
                <Link to={`/activity/${event.runId}`} className="mt-3 inline-block text-sm text-primary underline underline-offset-4">
                  View the matching workflow run &rarr;
                </Link>
              </div>
            )}

            <div className="mt-8 grid gap-8 border-t border-border pt-6 lg:grid-cols-2">
              <section>
                <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">Before state</p>
                <pre className="mt-3 max-h-96 overflow-auto border border-border bg-surface p-4 text-xs leading-relaxed text-primary">{formatJson(event.beforeState)}</pre>
              </section>
              <section>
                <p className="text-label font-mono uppercase tracking-[0.08em] text-muted">After state</p>
                <pre className="mt-3 max-h-96 overflow-auto border border-border bg-surface p-4 text-xs leading-relaxed text-primary">{formatJson(event.afterState)}</pre>
              </section>
            </div>

            <Link to="/audit" className="mt-8 inline-block border-t border-border pt-5 text-label font-mono uppercase tracking-[0.08em] text-muted hover:text-primary">
              &larr; Back to audit trail
            </Link>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}
