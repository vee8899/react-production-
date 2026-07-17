import { useState } from 'react';
import { formatRelativeTime } from '@/utils/time';
import { getServiceLabel } from '@/lib/serviceCatalog';

type RunSummary = {
  id: string;
  status: string;
  ran_at: string;
  records_processed: number;
  duration_ms: number | null;
};

type WorkflowRowProps = {
  name: string;
  description: string | null;
  featureType: string;
  isActive: boolean;
  lastRun: RunSummary | null;
  recentRuns: RunSummary[];
};

const dotColor = (isActive: boolean, lastRun: RunSummary | null): string => {
  if (!isActive) return '#6B6762';
  if (!lastRun) return '#6B6762';
  if (lastRun.status === 'success' || lastRun.status === 'partial') return '#22C55E';
  return '#A13A32';
};

const statusLabel = (lastRun: RunSummary | null, isActive: boolean): string => {
  if (!isActive) return 'Paused';
  if (!lastRun) return 'Never run';
  if (lastRun.status === 'success') return 'Healthy';
  if (lastRun.status === 'partial') return 'Degraded';
  if (lastRun.status === 'error') return 'Failing';
  return lastRun.status;
};

export const WorkflowRow = ({ name, description, featureType, isActive, lastRun, recentRuns }: WorkflowRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const lastRunTime = lastRun ? formatRelativeTime(lastRun.ran_at) : 'Never run';
  const recordsInfo = lastRun
    ? `${lastRun.records_processed} records · ${((lastRun.duration_ms ?? 0) / 1000).toFixed(1)}s`
    : '—';

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col gap-5 py-5 text-left sm:flex-row sm:items-start sm:justify-between cursor-pointer bg-transparent border-0"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="status-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: dotColor(isActive, lastRun),
              flexShrink: 0,
              marginTop: 6,
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
            <span className="block text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>
              <span
                style={{
                  color: dotColor(isActive, lastRun),
                }}
              >
                {statusLabel(lastRun, isActive)}
              </span>
              {' · '}{recordsInfo}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>
          {lastRunTime}
          <span className="ml-3" style={{ color: '#6B6762' }}>{expanded ? '−' : '+'}</span>
        </span>
      </button>

      {expanded && (
        <div className="pb-5 pl-[34px]">
          {recentRuns.length === 0 ? (
            <p className="text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>
              No run history available.
            </p>
          ) : (
            <div className="space-y-2">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between border-t border-border pt-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-label font-mono uppercase tracking-[0.05em]"
                      style={{
                        color:
                          run.status === 'success'
                            ? '#22C55E'
                            : run.status === 'partial'
                              ? '#A66A00'
                              : run.status === 'error'
                                ? '#A13A32'
                                : '#6B6762',
                      }}
                    >
                      {run.status}
                    </span>
                    <span className="text-label font-mono tracking-[0.05em]" style={{ color: '#6B6762' }}>
                      {run.records_processed} records
                    </span>
                    {run.duration_ms !== null && (
                      <span className="text-label font-mono tracking-[0.05em]" style={{ color: '#6B6762' }}>
                        {(run.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  <span className="text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>
                    {formatRelativeTime(run.ran_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
