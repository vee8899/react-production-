import { formatRelativeTime } from "@/utils/time";

type IntegrationCardProps = {
  provider: string;
  name: string;
  status: string;
  connectionHealth: string;
  lastSyncAt: string | null;
};

const statusColors: Record<string, string> = {
  connected: "#6B8F7A",
  pending: "#A66A00",
  paused: "#6B6762",
  error: "#A13A32",
  disconnected: "#A13A32",
};

const healthColors: Record<string, string> = {
  healthy: "#6B8F7A",
  degraded: "#A66A00",
  unhealthy: "#A13A32",
  unknown: "#6B6762",
};

const statusLabel = (status: string): string => {
  switch (status) {
    case "connected":
      return "Connected";
    case "pending":
      return "Pending";
    case "paused":
      return "Paused";
    case "error":
      return "Error";
    case "disconnected":
      return "Disconnected";
    default:
      return status;
  }
};

const healthLabel = (health: string): string => {
  switch (health) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "unhealthy":
      return "Unhealthy";
    default:
      return "Unknown";
  }
};

export const IntegrationCard = ({
  provider,
  name,
  status,
  connectionHealth,
  lastSyncAt,
}: IntegrationCardProps) => {
  return (
    <div className="border border-border bg-[#F7F5F1] p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-mono text-sm uppercase tracking-[0.08em]" style={{ color: "#6B6762" }}>
            {provider}
          </p>
          <h3 className="mt-1 font-display text-xl" style={{ color: "#0F0E0D" }}>
            {name}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusColors[status] ?? "#6B6762",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span className="font-mono text-xs uppercase tracking-[0.08em]" style={{ color: statusColors[status] ?? "#6B6762" }}>
            {statusLabel(status)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-label font-mono uppercase tracking-[0.05em]" style={{ color: "#6B6762" }}>
        <span style={{ color: healthColors[connectionHealth] ?? "#6B6762" }}>
          {healthLabel(connectionHealth)}
        </span>
        {lastSyncAt && (
          <span>
            {formatRelativeTime(lastSyncAt)}
          </span>
        )}
        {!lastSyncAt && status === "pending" && (
          <span>Awaiting setup</span>
        )}
      </div>
    </div>
  );
};
