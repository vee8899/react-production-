import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export const useRuns = (clientId: string | undefined, limit = 20) => {
  return useQuery({
    queryKey: ['runs', clientId, limit],
    enabled: !!clientId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_runs')
        .select('*')
        .eq('client_id', clientId!)
        .order('ran_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};
