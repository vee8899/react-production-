import { useClient } from '@/hooks/useClient';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

export const StatsRow = () => {
  const { data: client } = useClient();
  const { data: metrics } = useDashboardMetrics(client?.organization_id, client?.id);
  const totalRuns = metrics?.totalRuns ?? 0;
  const successRate = totalRuns > 0 ? Math.round(((metrics?.successfulRuns ?? 0) / totalRuns) * 100) : 0;

  const stats = [
    { value: totalRuns.toLocaleString(), label: 'Runs · 30 Days' },
    { value: `${successRate}%`, label: 'Success Rate' },
    { value: (metrics?.totalRecords ?? 0).toLocaleString(), label: 'Records Processed' },
    { value: `${Math.round((metrics?.avgDurationMs ?? 0) / 1000)}s`, label: 'Avg. Duration' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-10 gap-y-12">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <div className="font-mono leading-none whitespace-nowrap" style={{ color: '#0F0E0D', fontSize: 'clamp(3.25rem, 7vw, 7.5rem)', letterSpacing: 0 }}>
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
