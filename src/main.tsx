import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "@/api/supabase/client";
import { useAuthStore } from "@/store/authStore";
import App from "@/App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

// Bootstrap auth before rendering
const { setSession, setLoading } = useAuthStore.getState();

supabase.auth.getSession()
  .then(({ data: { session } }) => setSession(session))
  .catch(() => { /* no session; continue anonymous */ })
  .finally(() => setLoading(false));

supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
  setLoading(false);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
