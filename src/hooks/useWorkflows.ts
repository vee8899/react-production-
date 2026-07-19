import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export type RunSummary = {
  id: string;
  status: string;
  ran_at: string;
  records_processed: number;
  duration_ms: number | null;
};

export type WorkflowWithLatestRun = {
  id: string;
  name: string;
  description: string | null;
  feature_type: string;
  is_active: boolean;
  latestRun: RunSummary | null;
  recentRuns: RunSummary[];
};

const MAX_WORKFLOW_RUNS = 200;

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
        .select('id, workflow_id, status, started_at, records_processed, duration_ms')
        .eq('organization_id', organizationId!)
        .in('workflow_id', workflows.map((workflow) => workflow.id))
        .order('started_at', { ascending: false })
        // Keep the browser payload bounded. The UI only retains five runs per
        // workflow; a server-side aggregate can replace this cap later.
        .limit(Math.min(Math.max(workflows.length * 5, 20), MAX_WORKFLOW_RUNS));

      if (runError) throw runError;
      const latest = new Map<string, (typeof runs)[number]>();
      const recentByWorkflow = new Map<string, (typeof runs)[number][]>();
      (runs ?? []).forEach((run) => {
        if (run.workflow_id) {
          if (!latest.has(run.workflow_id)) latest.set(run.workflow_id, run);
          const list = recentByWorkflow.get(run.workflow_id) ?? [];
          if (list.length < 5) list.push(run);
          recentByWorkflow.set(run.workflow_id, list);
        }
      });
      return workflows.map((workflow) => {
        const run = latest.get(workflow.id);
        const recent = recentByWorkflow.get(workflow.id) ?? [];
        return {
          ...workflow,
          latestRun: run
            ? { id: run.id, status: run.status, ran_at: run.started_at, records_processed: run.records_processed, duration_ms: run.duration_ms }
            : null,
          recentRuns: recent.map((r) => ({
            id: r.id,
            status: r.status,
            ran_at: r.started_at,
            records_processed: r.records_processed,
            duration_ms: r.duration_ms,
          })),
        };
      });
    },
  });
