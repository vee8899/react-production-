import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createIngestHandler } from "./handler.ts";

serve(createIngestHandler({
  env: (key) => Deno.env.get(key),
  rpc: (url, key, args) => createClient(url, key).rpc("ingest_workflow_run", args),
}));
