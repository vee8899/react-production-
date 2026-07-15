import { supabase } from "@/api/supabase/client";

export type LegalDocumentKey = "terms_of_service" | "privacy_policy" | "ai_usage_disclosure";

export const REQUIRED_DOCUMENTS: LegalDocumentKey[] = [
  "terms_of_service",
  "privacy_policy",
  "ai_usage_disclosure",
];

export const DOCUMENT_LABELS: Record<LegalDocumentKey, string> = {
  terms_of_service: "Terms of Service",
  privacy_policy: "Privacy Policy",
  ai_usage_disclosure: "AI Usage Disclosure",
};

export const DOCUMENT_ROUTES: Record<LegalDocumentKey, string> = {
  terms_of_service: "/legal/terms",
  privacy_policy: "/legal/privacy",
  ai_usage_disclosure: "/legal/ai-disclosure",
};

export type LegalDocument = {
  id: string;
  document_key: string;
  version: string;
  title: string;
  content_md: string;
  effective_at: string;
  created_at: string;
  updated_at: string;
};

export type LegalConsent = {
  id: string;
  organization_id: string;
  client_id: string;
  document_key: string;
  document_version: string;
  consented_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type CookiePreference = {
  id: string;
  organization_id: string;
  client_id: string;
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  consented_at: string;
  updated_at: string;
};

export const fetchLatestDocument = async (documentKey: LegalDocumentKey): Promise<LegalDocument | null> => {
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("document_key", documentKey)
    .order("effective_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const fetchCurrentConsents = async (clientId: string): Promise<LegalConsent[]> => {
  const { data, error } = await supabase
    .from("legal_consents")
    .select("*")
    .eq("client_id", clientId);

  if (error) throw error;
  return data ?? [];
};

export const checkConsentStatus = async (
  clientId: string
): Promise<Record<LegalDocumentKey, boolean>> => {
  const [consents, ...documents] = await Promise.all([
    fetchCurrentConsents(clientId),
    ...REQUIRED_DOCUMENTS.map(fetchLatestDocument),
  ]);

  const result: Record<LegalDocumentKey, boolean> = {
    terms_of_service: false,
    privacy_policy: false,
    ai_usage_disclosure: false,
  };

  for (let i = 0; i < REQUIRED_DOCUMENTS.length; i++) {
    const doc = documents[i];
    const key = REQUIRED_DOCUMENTS[i];
    if (!doc) continue;
    result[key] = consents.some(
      (c) => c.document_key === key && c.document_version === doc.version
    );
  }

  return result;
};

export const submitConsents = async (
  clientId: string,
  organizationId: string,
  documentKeys: LegalDocumentKey[]
): Promise<void> => {
  const documents = await Promise.all(documentKeys.map(fetchLatestDocument));

  const rows = documents
    .filter((doc): doc is LegalDocument => doc !== null)
    .map((doc) => ({
      client_id: clientId,
      organization_id: organizationId,
      document_key: doc.document_key,
      document_version: doc.version,
      user_agent: navigator.userAgent,
    }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("legal_consents").insert(rows);
  if (error) throw error;
};

export const fetchCookiePreferences = async (clientId: string): Promise<CookiePreference | null> => {
  const { data, error } = await supabase
    .from("cookie_preferences")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const upsertCookiePreferences = async (
  clientId: string,
  organizationId: string,
  prefs: { functional: boolean; analytics: boolean; marketing: boolean }
): Promise<void> => {
  const { error } = await supabase.from("cookie_preferences").upsert(
    {
      client_id: clientId,
      organization_id: organizationId,
      essential: true,
      functional: prefs.functional,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
    },
    { onConflict: "client_id" }
  );

  if (error) throw error;
};
