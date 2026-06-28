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
  const { data: runs, isLoading, error } = useRuns(client?.id, 10);

  if (isLoading) {
    return (
      <div style={{ color: '#6B6762', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
        LOADING...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#6B6762', fontSize: '0.75rem' }}>
        Failed to load data. Please refresh.
      </div>
    );
  }

  if (!runs || runs.length === 0) {
    return (
      <div style={{ color: '#6B6762', fontSize: '1rem' }}>
        No data yet. Automations will appear here once workflows run.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-0">
      {runs.map((run) => (
        <div
          key={run.id}
          className="flex items-center justify-between py-4 border-b border-border"
        >
          <div className="flex flex-col">
            <span className="text-base font-sans font-light" style={{ color: '#0F0E0D' }}>
              {run.workflow_name}
            </span>
            <span className="text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>
              {run.records_processed} records · {run.status}
            </span>
          </div>
          <span className="text-label font-mono uppercase tracking-[0.05em] shrink-0 ml-4" style={{ color: '#6B6762' }}>
            {formatRelativeTime(run.ran_at)}
          </span>
        </div>
      ))}
    </div>
  );
};