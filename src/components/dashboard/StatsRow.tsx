import { useClient } from '@/hooks/useClient';
import { useRuns } from '@/hooks/useRuns';

export const StatsRow = () => {
  const { data: client } = useClient();
  const { data: runs } = useRuns(client?.id, 50);

  const totalRuns = runs?.length ?? 0;
  const totalRecords = runs?.reduce((sum, run) => sum + run.records_processed, 0) ?? 0;
  const successfulRuns = runs?.filter((run) => run.status === "success").length ?? 0;
  const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;
  const snapshotsWithDuration = runs?.filter((run) => run.duration_ms !== null) ?? [];
  const avgDuration =
    snapshotsWithDuration.length > 0
      ? Math.round(
          snapshotsWithDuration.reduce((sum, run) => sum + (run.duration_ms ?? 0), 0) /
            snapshotsWithDuration.length /
            1000
        )
      : 0;

  const stats = [
    { value: totalRuns.toLocaleString(), label: 'Recent Runs' },
    { value: `${successRate}%`, label: 'Success Rate' },
    { value: totalRecords.toLocaleString(), label: 'Records Processed' },
    { value: `${avgDuration}s`, label: 'Avg. Duration' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-10 gap-y-12">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <div
            className="font-mono leading-none whitespace-nowrap"
            style={{
              color: '#0F0E0D',
              fontSize: 'clamp(3.25rem, 7vw, 7.5rem)',
              letterSpacing: 0,
            }}
          >
            {stat.value}
          </div>
          <div className="text-label font-sans uppercase tracking-[0.08em] mt-2" style={{ color: '#6B6762' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
