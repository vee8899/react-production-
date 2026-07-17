import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";

export type DailyRunCount = {
  date: string;
  total: number;
  successful: number;
  failed: number;
};

const dayBuckets = (days: number, runs: { status: string; started_at: string }[]): DailyRunCount[] => {
  const map = new Map<string, { total: number; successful: number; failed: number }>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { total: 0, successful: 0, failed: 0 });
  }
  runs.forEach((run) => {
    const key = run.started_at.slice(0, 10);
    const bucket = map.get(key);
    if (bucket) {
      bucket.total++;
      if (run.status === "success") bucket.successful++;
      else bucket.failed++;
    }
  });
  return Array.from(map.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));
};

export const useRunsTimeline = (organizationId: string | undefined, windowDays = 30) =>
  useQuery({
    queryKey: ["runs-timeline", organizationId, `${windowDays}d`],
    enabled: !!organizationId,
    refetchInterval: 60_000,
    queryFn: async (): Promise<DailyRunCount[]> => {
      const start = new Date();
      start.setDate(start.getDate() - windowDays);
      const { data, error } = await supabase
        .from("workflow_runs")
        .select("status, started_at")
        .eq("organization_id", organizationId!)
        .gte("started_at", start.toISOString())
        .order("started_at", { ascending: true });

      if (error) throw error;
      return dayBuckets(windowDays, data ?? []);
    },
  });
