import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export type WorkflowWithLatestRun = {
  id: string;
  name: string;
  description: string | null;
  feature_type: string;
  is_active: boolean;
  latestRun: {
    status: string;
    ran_at: string;
    records_processed: number;
    duration_ms: number | null;
  } | null;
};

export const useWorkflows = (clientId: string | undefined, organizationId?: string) =>
  useQuery({
    queryKey: ['workflows', clientId, organizationId],
    enabled: !!clientId && !!organizationId,
    refetchInterval: 30_000,
    queryFn: async (): Promise<WorkflowWithLatestRun[]> => {
      const { data: workflows, error: workflowError } = await supabase
        .from('workflows')
        .select('id, name, description, feature_type, is_active')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false });

      if (workflowError) throw workflowError;
      if (!workflows?.length) return [];

      const { data: runs, error: runError } = await supabase
        .from('workflow_runs')
        .select('workflow_id, status, started_at, records_processed, duration_ms')
        .eq('organization_id', organizationId!)
        .in('workflow_id', workflows.map((workflow) => workflow.id))
        .order('started_at', { ascending: false });

      if (runError) throw runError;
      const latest = new Map<string, (typeof runs)[number]>();
      (runs ?? []).forEach((run) => {
        if (run.workflow_id && !latest.has(run.workflow_id)) latest.set(run.workflow_id, run);
      });
      return workflows.map((workflow) => {
        const run = latest.get(workflow.id);
        return {
          ...workflow,
          latestRun: run
            ? { status: run.status, ran_at: run.started_at, records_processed: run.records_processed, duration_ms: run.duration_ms }
            : null,
        };
      });
    },
  });
