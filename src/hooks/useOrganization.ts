import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";

export const useOrganization = (organizationId: string | undefined) =>
  useQuery({
    queryKey: ["organization", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, slug, vertical_key")
        .eq("id", organizationId!)
        .single();

      if (error) throw error;
      return data;
    },
  });
