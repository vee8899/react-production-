import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export type DashboardRun = {
  id: string;
  featureKey: string;
  workflowName: string;
  status: string;
  ranAt: string;
  recordsProcessed: number;
  recordsFailed: number;
  durationMs: number | null;
};

export const useRuns = (_clientId: string | undefined, limit = 20, organizationId?: string) => {
  return useQuery({
    queryKey: ['runs', _clientId, organizationId, limit],
    enabled: !!organizationId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_runs')
        .select('id, feature_key, status, started_at, duration_ms, records_processed, records_failed, workflow_id')
        .eq('organization_id', organizationId!)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      const workflowIds = (data ?? []).map((run) => run.workflow_id).filter((id): id is string => !!id);
      const names = new Map<string, string>();
      if (workflowIds.length) {
        const { data: workflowNames, error: workflowNamesError } = await supabase
          .from('workflows')
          .select('id, name')
          .in('id', workflowIds);
        if (workflowNamesError) throw workflowNamesError;
        (workflowNames ?? []).forEach((workflow) => names.set(workflow.id, workflow.name));
      }
      return (data ?? []).map((run) => ({
        id: run.id,
        featureKey: run.feature_key,
        workflowName: names.get(run.workflow_id ?? '') ?? run.feature_key,
        status: run.status,
        ranAt: run.started_at,
        recordsProcessed: run.records_processed,
        recordsFailed: run.records_failed,
        durationMs: run.duration_ms,
      } satisfies DashboardRun));
    },
  });
};
