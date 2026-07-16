import { formatRelativeTime } from '@/utils/time';
import { getServiceLabel } from '@/lib/serviceCatalog';

type WorkflowRowProps = {
  name: string;
  description: string | null;
  featureType: string;
  isActive: boolean;
  lastRun: {
    status: string;
    ran_at: string;
    records_processed: number;
    duration_ms: number | null;
  } | null;
};

export const WorkflowRow = ({ name, description, featureType, isActive, lastRun }: WorkflowRowProps) => {
  const lastRunTime = lastRun
    ? formatRelativeTime(lastRun.ran_at)
    : 'Never run';

  const recordsInfo = lastRun
    ? `${lastRun.records_processed} records · ${((lastRun.duration_ms ?? 0) / 1000).toFixed(1)}s`
    : '—';

  return (
    <div className="flex flex-col gap-5 border-b border-border py-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
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
        <div className="flex min-w-0 flex-col gap-1">
          <span className="block text-base font-sans font-light" style={{ color: '#0F0E0D' }}>{name}</span>
          {description && (
            <span className="block max-w-3xl text-sm font-sans font-light leading-relaxed" style={{ color: '#6B6762' }}>{description}</span>
          )}
          <span className="mt-1 block text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>
            {getServiceLabel(featureType)}
          </span>
          <span className="block text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>{recordsInfo}</span>
        </div>
      </div>
      <span className="shrink-0 text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>{lastRunTime}</span>
    </div>
  );
};
