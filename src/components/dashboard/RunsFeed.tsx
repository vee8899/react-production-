import { useClient } from '@/hooks/useClient';
import { useRuns } from '@/hooks/useRuns';
import { formatRelativeTime } from '@/utils/time';

const fallbackFeature = 'custom_workflow';
const featureLabels: Record<string, string> = {
  lead_follow_up: 'Lead Follow-Up',
  listing_notifications: 'Listing Notifications',
  client_communication: 'Client Communication',
  crm_sync: 'CRM Sync',
  document_generation: 'Document Generation',
  appointment_scheduling: 'Appointment Scheduling',
  data_pipeline: 'Data Pipelines',
  custom_workflow: 'Custom Workflows',
  workflow_automation: 'Workflow Automation',
  integrations: 'System Integrations',
  notifications: 'Notifications',
  reporting: 'Reporting',
  ai_operations: 'AI Operations',
  custom_modules: 'Custom Modules',
};

export const RunsFeed = () => {
  const { data: client } = useClient();
  const { data: runs, isLoading, error } = useRuns(client?.id, 10, client?.organization_id);

  if (isLoading) return <div style={{ color: '#6B6762', fontSize: '0.75rem', letterSpacing: '0.08em' }}>LOADING...</div>;
  if (error) return <div style={{ color: '#6B6762', fontSize: '0.75rem' }}>Failed to load data. Please refresh.</div>;
  if (!runs?.length) return <div style={{ color: '#6B6762', fontSize: '1rem' }}>No data yet. Automations will appear here once workflows run.</div>;

  return (
    <div className="mt-8 space-y-0">
      {runs.map((run) => (
        <div key={run.id} className="flex items-center justify-between py-4 border-b border-border">
          <div className="flex flex-col">
            <span className="text-label font-mono uppercase tracking-[0.08em]" style={{ color: '#6B6762' }}>
              {featureLabels[run.featureKey ?? fallbackFeature] ?? run.featureKey ?? fallbackFeature}
            </span>
            <span className="text-base font-sans font-light" style={{ color: '#0F0E0D' }}>{run.workflowName}</span>
            <span className="text-label font-mono uppercase tracking-[0.05em]" style={{ color: '#6B6762' }}>
              {run.recordsProcessed} records · {run.status}
            </span>
          </div>
          <span className="text-label font-mono uppercase tracking-[0.05em] shrink-0 ml-4" style={{ color: '#6B6762' }}>
            {formatRelativeTime(run.ranAt)}
          </span>
        </div>
      ))}
    </div>
  );
};
