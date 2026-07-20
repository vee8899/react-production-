import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { PostHogProvider } from "@posthog/react";
import { supabase } from "@/api/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { initPostHog, posthogClient } from "@/lib/posthog";
import { initSentry, syncSentryIdentity } from "@/lib/sentry";
import App from "@/App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

// Bootstrap auth before rendering
const { setSession, setLoading } = useAuthStore.getState();
initSentry();
initPostHog();

supabase.auth.getSession()
  .then(({ data: { session } }) => {
    setSession(session);
    syncSentryIdentity(session);
  })
  .catch(() => { /* no session; continue anonymous */ })
  .finally(() => setLoading(false));

supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
  syncSentryIdentity(session);
  setLoading(false);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthogClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </PostHogProvider>
  </StrictMode>
);
