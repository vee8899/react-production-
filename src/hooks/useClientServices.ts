import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";

export const useClientServices = (clientId: string | undefined) =>
  useQuery({
    queryKey: ["client-services", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_services")
        .select("feature_type, status")
        .eq("client_id", clientId!)
        .order("feature_type");

      if (error) throw error;
      return data;
    },
  });
