import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";

export type DashboardMetrics = {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalRecords: number;
  avgDurationMs: number;
  retries: number;
  source: "workflow_runs" | "analytics_snapshots" | "compatibility";
};

const emptyMetrics: DashboardMetrics = {
  totalRuns: 0,
  successfulRuns: 0,
  failedRuns: 0,
  totalRecords: 0,
  avgDurationMs: 0,
  retries: 0,
  source: "workflow_runs",
};

const startOfWindow = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
};

export const useDashboardMetrics = (organizationId: string | undefined, clientId: string | undefined) =>
  useQuery({
    queryKey: ["dashboard-metrics", organizationId, clientId, "30d"],
    enabled: !!organizationId || !!clientId,
    refetchInterval: 30_000,
    queryFn: async (): Promise<DashboardMetrics> => {
      if (organizationId) {
        const { data, error } = await supabase
          .from("workflow_runs")
          .select("status, duration_ms, retries, records_processed, records_failed")
          .eq("organization_id", organizationId)
          .gte("started_at", startOfWindow());

        if (!error && data && data.length > 0) {
          const completed = data.filter((run) => run.duration_ms !== null);
          return {
            totalRuns: data.length,
            successfulRuns: data.filter((run) => run.status === "success").length,
            failedRuns: data.filter((run) => run.status !== "success").length,
            totalRecords: data.reduce((sum, run) => sum + (run.records_processed ?? 0), 0),
            avgDurationMs: completed.length
              ? completed.reduce((sum, run) => sum + (run.duration_ms ?? 0), 0) / completed.length
              : 0,
            retries: data.reduce((sum, run) => sum + (run.retries ?? 0), 0),
            source: "workflow_runs",
          };
        }

        const { data: snapshots, error: snapshotError } = await supabase
          .from("analytics_snapshots")
          .select("total_runs, successful_runs, failed_runs, total_records, avg_duration_ms")
          .eq("organization_id", organizationId)
          .gte("snapshot_date", startOfWindow().slice(0, 10));

        if (!snapshotError && snapshots && snapshots.length > 0) {
          return {
            totalRuns: snapshots.reduce((sum, item) => sum + item.total_runs, 0),
            successfulRuns: snapshots.reduce((sum, item) => sum + item.successful_runs, 0),
            failedRuns: snapshots.reduce((sum, item) => sum + item.failed_runs, 0),
            totalRecords: snapshots.reduce((sum, item) => sum + item.total_records, 0),
            avgDurationMs:
              snapshots.reduce((sum, item) => sum + (item.avg_duration_ms ?? 0), 0) / snapshots.length,
            retries: 0,
            source: "analytics_snapshots",
          };
        }
      }

      if (clientId) {
        const { data: legacyRuns, error } = await supabase
          .from("automation_runs")
          .select("status, duration_ms, records_processed")
          .eq("client_id", clientId)
          .gte("ran_at", startOfWindow());

        if (!error && legacyRuns) {
          const completed = legacyRuns.filter((run) => run.duration_ms !== null);
          return {
            totalRuns: legacyRuns.length,
            successfulRuns: legacyRuns.filter((run) => run.status === "success").length,
            failedRuns: legacyRuns.filter((run) => run.status !== "success").length,
            totalRecords: legacyRuns.reduce((sum, run) => sum + run.records_processed, 0),
            avgDurationMs: completed.length
              ? completed.reduce((sum, run) => sum + (run.duration_ms ?? 0), 0) / completed.length
              : 0,
            retries: 0,
            source: "compatibility",
          };
        }
      }

      return emptyMetrics;
    },
  });
