const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

export const browserPreflight = (request: Request) => request.method === "OPTIONS"
  ? new Response(null, { status: 204, headers: corsHeaders })
  : null;

export const browserJson = (body: unknown, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...corsHeaders,
    "Content-Type": "application/json",
    ...(status === 405 ? { Allow: "POST, OPTIONS" } : {}),
  },
});
