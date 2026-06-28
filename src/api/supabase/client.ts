import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { env } from "@/utils/env";

export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey
);