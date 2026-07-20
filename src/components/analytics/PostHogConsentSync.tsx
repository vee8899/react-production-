import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCookiePreferences } from "@/hooks/useCookiePreferences";
import { setPostHogAnalyticsConsent, syncPostHogIdentity } from "@/lib/posthog";

export default function PostHogConsentSync() {
  const { session, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: preferences, isLoading: preferencesLoading } = useCookiePreferences();

  useEffect(() => {
    if (authLoading || preferencesLoading) return;

    const hasAnalyticsConsent = Boolean(isAuthenticated && preferences?.analytics);
    setPostHogAnalyticsConsent(hasAnalyticsConsent);
    syncPostHogIdentity(hasAnalyticsConsent ? session : null);
  }, [authLoading, isAuthenticated, preferences?.analytics, preferencesLoading, session]);

  return null;
}
