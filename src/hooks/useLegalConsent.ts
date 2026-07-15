import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/hooks/useClient";
import {
  checkConsentStatus,
  type LegalDocumentKey,
} from "@/lib/legalConsent";

export type ConsentStatus = Record<LegalDocumentKey, boolean>;

export const useLegalConsent = () => {
  const { data: client } = useClient();

  return useQuery({
    queryKey: ["legal-consent", client?.id],
    enabled: !!client?.id,
    queryFn: () => checkConsentStatus(client!.id),
  });
};
