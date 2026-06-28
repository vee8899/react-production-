import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { PostgrestError } from "@supabase/supabase-js";

type SupabaseQueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export const useSupabaseQuery = <T>(
  key: string[],
  queryFn: () => Promise<SupabaseQueryResult<T>>,
  options?: Omit<UseQueryOptions<T, PostgrestError>, "queryKey" | "queryFn">
) => {
  return useQuery<T, PostgrestError>({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data as T;
    },
    ...options,
  });
};