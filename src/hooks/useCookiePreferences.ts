import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/hooks/useClient";
import { fetchCookiePreferences } from "@/lib/legalConsent";

export const useCookiePreferences = () => {
  const { data: client } = useClient();

  return useQuery({
    queryKey: ["cookie-preferences", client?.id],
    enabled: !!client?.id,
    queryFn: () => fetchCookiePreferences(client!.id),
  });
};
