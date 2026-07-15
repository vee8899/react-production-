-- RLS insert policies for legal_consents
CREATE POLICY "legal_consents_insert_member" ON public.legal_consents
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- RLS insert/update policies for cookie_preferences
CREATE POLICY "cookie_preferences_owner_insert" ON public.cookie_preferences
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
    AND organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "cookie_preferences_owner_update" ON public.cookie_preferences
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
    AND organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );
