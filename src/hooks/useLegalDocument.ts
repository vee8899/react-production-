import { useQuery } from "@tanstack/react-query";
import {
  fetchLatestDocument,
  type LegalDocumentKey,
} from "@/lib/legalConsent";

export const useLegalDocument = (documentKey: LegalDocumentKey) => {
  return useQuery({
    queryKey: ["legal-document", documentKey],
    queryFn: () => fetchLatestDocument(documentKey),
  });
};
