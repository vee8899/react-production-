import { useClient } from '@/hooks/useClient';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRuns } from '@/hooks/useRuns';

export const StatsRow = () => {
  const { data: client } = useClient();
  const { data: snapshots } = useAnalytics(client?.id);
  const { data: runs } = useRuns(client?.id);

  // Compute stats from real data
  const totalRuns = snapshots?.reduce((sum, s) => sum + s.total_runs, 0) ?? 0;
  const totalRecords = snapshots?.reduce((sum, s) => sum + s.total_records, 0) ?? 0;
  const successRate = snapshots && snapshots.length > 0
    ? Math.round(
        (snapshots.reduce((sum, s) => sum + s.successful_runs, 0) /
          snapshots.reduce((sum, s) => sum + s.total_runs, 0)) * 100
      )
    : 0;
  const avgDuration = snapshots && snapshots.length > 0
    ? Math.round(
        snapshots.reduce((sum, s) => sum + (s.avg_duration_ms ?? 0), 0) /
          snapshots.length / 1000
      )
    : 0;

  const stats = [
    { value: totalRuns.toLocaleString(), label: 'Workflows Run' },
    { value: `${successRate}%`, label: 'Success Rate' },
    { value: totalRecords.toLocaleString(), label: 'Records Processed' },
    { value: `${avgDuration}s`, label: 'Avg. Duration' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="text-hero font-mono leading-none" style={{ color: '#0F0E0D' }}>
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