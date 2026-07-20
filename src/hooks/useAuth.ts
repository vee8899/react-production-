// src/hooks/useAuth.ts
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/api/supabase/client';
import { syncSentryIdentity } from '@/lib/sentry';
import { syncPostHogIdentity } from '@/lib/posthog';

export const useAuth = () => {
  const { session, isLoading, setSession } = useAuthStore();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    syncSentryIdentity(null);
    syncPostHogIdentity(null);
    navigate('/');
  };

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading,
    signOut,
  };
};
