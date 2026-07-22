import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";
import type { Database } from "@/types/supabase";

type IntegrationRow = Database["public"]["Tables"]["integrations"]["Row"];

export type ConnectedIntegration = Pick<
  IntegrationRow,
  "id" | "provider" | "name" | "status" | "connection_health" | "last_sync_at" | "configuration"
>;

export const useIntegrations = (organizationId: string | undefined) =>
  useQuery({
    queryKey: ["integrations", organizationId],
    enabled: !!organizationId,
    refetchInterval: 30_000,
    queryFn: async (): Promise<ConnectedIntegration[]> => {
      const { data, error } = await supabase
        .from("integrations")
        .select("id, provider, name, status, connection_health, last_sync_at, configuration")
        .eq("organization_id", organizationId!)
        .order("name");

      if (error) throw error;
      return data ?? [];
    },
  });
