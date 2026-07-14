import { formatRelativeTime } from '@/utils/time';

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

const featureLabels: Record<string, string> = {
  lead_follow_up: 'Lead Follow-Up',
  listing_notifications: 'Listing Notifications',
  client_communication: 'Client Communication',
  crm_sync: 'CRM Sync',
  document_generation: 'Document Generation',
  appointment_scheduling: 'Appointment Scheduling',
  data_pipeline: 'Data Pipelines',
  custom_workflow: 'Custom Workflows',
};

export const WorkflowRow = ({ name, description, featureType, isActive, lastRun }: WorkflowRowProps) => {
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
          <span className="workflow-meta" style={{ color: '#6B6762' }}>
            {featureLabels[featureType] ?? featureType}
          </span>
          <span className="workflow-meta" style={{ color: '#6B6762' }}>{recordsInfo}</span>
        </div>
      </div>
      <span className="workflow-time" style={{ color: '#6B6762' }}>{lastRunTime}</span>
    </div>
  );
};
