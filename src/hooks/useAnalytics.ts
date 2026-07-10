import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export const useAnalytics = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['analytics', clientId],
    enabled: !!clientId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('client_id', clientId!)
        .order('snapshot_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    },
  });
};
