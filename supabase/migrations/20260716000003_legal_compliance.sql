-- Legal document versions
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_key TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_key, version)
);

-- Client consent records
CREATE TABLE public.legal_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  document_key TEXT NOT NULL,
  document_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, document_key, document_version)
);

-- Cookie preferences
CREATE TABLE public.cookie_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  essential BOOLEAN NOT NULL DEFAULT true,
  functional BOOLEAN NOT NULL DEFAULT false,
  analytics BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id)
);

-- Indexes
CREATE INDEX idx_legal_documents_key_version ON public.legal_documents(document_key, version);
CREATE INDEX idx_legal_documents_effective ON public.legal_documents(document_key, effective_at DESC);
CREATE INDEX idx_legal_consents_org ON public.legal_consents(organization_id);
CREATE INDEX idx_legal_consents_client ON public.legal_consents(client_id, document_key);
CREATE INDEX idx_cookie_preferences_client ON public.cookie_preferences(client_id);

-- RLS: legal_documents (public read)
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_documents_public_read" ON public.legal_documents
  FOR SELECT USING (true);

-- RLS: legal_consents (org-scoped read)
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_consents_org_read" ON public.legal_consents
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS: cookie_preferences (owner read)
ALTER TABLE public.cookie_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cookie_preferences_owner_read" ON public.cookie_preferences
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Seed initial document versions with placeholder content
INSERT INTO public.legal_documents (document_key, version, title, content_md, effective_at)
VALUES
  ('terms_of_service', '1.0.0', 'Terms of Service', E'[TERMS OF SERVICE PLACEHOLDER]\n\nThese terms govern your use of the Prime State Systems platform.', now()),
  ('privacy_policy', '1.0.0', 'Privacy Policy', E'[PRIVACY POLICY PLACEHOLDER]\n\nThis policy describes how we collect and use your data.', now()),
  ('ai_usage_disclosure', '1.0.0', 'AI Usage Disclosure', E'[AI DISCLOSURE PLACEHOLDER]\n\nThis disclosure describes how AI is used within the platform.', now());
