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

export const useRuns = (clientId: string | undefined, limit = 20, organizationId?: string) => {
  return useQuery({
    queryKey: organizationId ? ['runs', clientId, organizationId, limit] : ['runs', clientId, limit],
    enabled: !!clientId || !!organizationId,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (organizationId) {
        const { data, error } = await supabase
          .from('workflow_runs')
          .select('id, feature_key, status, started_at, duration_ms, records_processed, records_failed, workflow_id')
          .eq('organization_id', organizationId)
          .order('started_at', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          const workflowIds = data.map((run) => run.workflow_id).filter((id): id is string => !!id);
          const workflowNames = workflowIds.length
            ? await supabase.from('workflows').select('id, name').in('id', workflowIds)
            : { data: [] as { id: string; name: string }[] };
          const names = new Map((workflowNames.data ?? []).map((workflow) => [workflow.id, workflow.name]));
          return data.map((run) => ({
            id: run.id,
            featureKey: run.feature_key,
            workflowName: names.get(run.workflow_id ?? '') ?? run.feature_key,
            status: run.status,
            ranAt: run.started_at,
            recordsProcessed: run.records_processed,
            recordsFailed: run.records_failed,
            durationMs: run.duration_ms,
          } satisfies DashboardRun));
        }
      }

      const { data, error } = await supabase
        .from('automation_runs')
        .select('id, feature_type, workflow_name, status, ran_at, records_processed, records_failed, duration_ms')
        .eq('client_id', clientId!)
        .order('ran_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []).map((run) => ({
        id: run.id,
        featureKey: run.feature_type,
        workflowName: run.workflow_name,
        status: run.status,
        ranAt: run.ran_at,
        recordsProcessed: run.records_processed,
        recordsFailed: run.records_failed,
        durationMs: run.duration_ms,
      } satisfies DashboardRun));
    },
  });
};
