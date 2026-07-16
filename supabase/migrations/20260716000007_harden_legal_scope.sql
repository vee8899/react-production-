-- Consent and preference records must belong to the same organization as the
-- authenticated user's client record.
DROP POLICY IF EXISTS "legal_consents_insert_owner" ON public.legal_consents;
CREATE POLICY "legal_consents_insert_owner"
  ON public.legal_consents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = public.legal_consents.client_id
        AND c.user_id = auth.uid()
        AND c.organization_id = public.legal_consents.organization_id
    )
  );

DROP POLICY IF EXISTS "cookie_preferences_owner_insert" ON public.cookie_preferences;
CREATE POLICY "cookie_preferences_owner_insert"
  ON public.cookie_preferences
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = public.cookie_preferences.client_id
        AND c.user_id = auth.uid()
        AND c.organization_id = public.cookie_preferences.organization_id
    )
  );

DROP POLICY IF EXISTS "cookie_preferences_owner_update" ON public.cookie_preferences;
CREATE POLICY "cookie_preferences_owner_update"
  ON public.cookie_preferences
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = public.cookie_preferences.client_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = public.cookie_preferences.client_id
        AND c.user_id = auth.uid()
        AND c.organization_id = public.cookie_preferences.organization_id
    )
  );
