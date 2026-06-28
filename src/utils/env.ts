const optional = (key: string, fallback: string): string => {
  const val = import.meta.env[key];
  return val || fallback;
};

export const env = {
  supabase: {
    url: optional("VITE_SUPABASE_URL", "https://placeholder.supabase.co"),
    anonKey: optional("VITE_SUPABASE_ANON_KEY", "placeholder-anon-key"),
  },
  n8n: {
    baseUrl: optional("VITE_N8N_BASE_URL", "https://placeholder.n8n.io"),
    apiKey: optional("VITE_N8N_API_KEY", "placeholder-api-key"),
  },
} as const;