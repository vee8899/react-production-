import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';

export const useWorkflows = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['workflows', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          automation_runs (
            status,
            ran_at,
            records_processed,
            duration_ms
          )
        `)
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};