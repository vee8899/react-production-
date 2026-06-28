// src/hooks/useAuth.ts
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/api/supabase/client';

export const useAuth = () => {
  const { session, isLoading, setSession } = useAuthStore();

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    window.location.href = '/';
  };

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading,
    signOut,
  };
};