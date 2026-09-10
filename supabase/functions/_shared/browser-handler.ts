import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database } from "../../../src/types/supabase.ts";

export type BrowserHandlerDependencies = {
  env: (name: string) => string | undefined;
  createClient: (url: string, key: string) => SupabaseClient<Database>;
};
