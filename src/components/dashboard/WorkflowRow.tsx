const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day ago`;
};

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
          <span className="workflow-name" style={{ color: '#0F0E0D' }}>{name}</span>
          {description && (
            <span className="workflow-desc" style={{ color: '#6B6762' }}>{description}</span>
          )}
          <span className="workflow-meta" style={{ color: '#6B6762' }}>{recordsInfo}</span>
        </div>
      </div>
      <span className="workflow-time" style={{ color: '#6B6762' }}>{lastRunTime}</span>
    </div>
  );
};