-- Fix: legal_consents INSERT policy was too restrictive.
-- The organization_members check fails for clients who haven't been fully
-- provisioned into organization_members yet (e.g. new signups mid-flow).
-- Replace with a simpler ownership check: client must belong to auth.uid().

DROP POLICY IF EXISTS "legal_consents_insert_member" ON public.legal_consents;

CREATE POLICY "legal_consents_insert_owner" ON public.legal_consents
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );
