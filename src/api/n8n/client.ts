import { env } from "@/utils/env";

export const n8nFetch = async <T>(
  path: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(`${env.n8n.baseUrl}${path}`, {
    ...options,
    headers: {
      "X-N8N-API-KEY": env.n8n.apiKey,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`n8n request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
};