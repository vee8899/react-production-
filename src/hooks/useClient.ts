import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useClient = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
};