import { n8nFetch } from "./client";
import type { N8nWorkflow } from "@/types/n8n";

export const listWorkflows = () =>
  n8nFetch<{ data: N8nWorkflow[] }>("/api/v1/workflows");

export const activateWorkflow = (id: string) =>
  n8nFetch<N8nWorkflow>(`/api/v1/workflows/${id}/activate`, {
    method: "POST",
  });