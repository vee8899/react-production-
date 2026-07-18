import { useClient } from "@/hooks/useClient";
import { useAuditLog } from "@/hooks/useAuditLog";
import { formatRelativeTime } from "@/utils/time";
import { Link } from "react-router-dom";

export const AuditTrail = ({ limit = 8, windowDays }: { limit?: number; windowDays?: number }) => {
  const { data: client } = useClient();
  const { data: events, isLoading, error } = useAuditLog(client?.organization_id, limit, windowDays);

  if (isLoading) return <p className="text-label uppercase tracking-[0.08em] text-muted">Loading audit trail...</p>;
  if (error) return <p className="text-label uppercase tracking-[0.08em] text-muted">Audit trail is unavailable. Please refresh.</p>;
  if (!events?.length) return <p className="text-sm font-light leading-relaxed text-muted">No audit events have been recorded yet.</p>;

  return (
    <div className="divide-y divide-border border-y border-border">
      {events.map((event) => (
        <Link key={event.id} to={`/audit/${event.id}`} className="block py-4 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="break-words font-sans text-sm text-primary">
                {event.action.replaceAll("_", " ")}
              </p>
              <p className="mt-1 break-words text-label font-mono uppercase tracking-[0.05em] text-muted">
                {event.entityType} · {event.actorType}{event.workflowName ? ` · ${event.workflowName}` : ""}
              </p>
            </div>
            <span className="shrink-0 text-label font-mono uppercase tracking-[0.05em] text-muted">
              {formatRelativeTime(event.createdAt)}
            </span>
          </div>
          {event.requestId && (
            <p className="mt-2 break-all text-label font-mono tracking-[0.04em] text-muted">
              Ref: {event.requestId}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
};
