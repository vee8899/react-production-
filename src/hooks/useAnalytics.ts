import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export const useAnalytics = (clientId: string | undefined, organizationId?: string) => {
  return useQuery({
    queryKey: ['analytics', clientId, organizationId],
    enabled: !!clientId || !!organizationId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const query = supabase
        .from('analytics_snapshots')
        .select('*');

      const { data, error } = await (organizationId
        ? query.eq('organization_id', organizationId).order('snapshot_date', { ascending: false }).limit(30)
        : query.eq('client_id', clientId!).order('snapshot_date', { ascending: false }).limit(30));

      if (error) throw error;
      return data;
    },
  });
};
