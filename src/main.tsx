import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";
import { useAuthStore } from "@/store/authStore";
import App from "@/App";
import "./index.css";

const queryClient = new QueryClient();

// Bootstrap auth before rendering
const { setSession, setLoading } = useAuthStore.getState();

supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  setLoading(false);
});

supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
  setLoading(false);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);