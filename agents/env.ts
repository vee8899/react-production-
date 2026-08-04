import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import type { AgentEnv } from "./config.ts";

const ENV_FILES = [".env", ".env.local"] as const;

/**
 * Load gitignored .env and .env.local files into process.env. Existing
 * environment variables always win (override is disabled), so a key set in
 * the shell takes precedence over the file. Missing files are not an error.
 */
export function loadEnvFiles(root = process.cwd()): void {
  for (const file of ENV_FILES) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    config({ path, override: false });
  }
}

export function loadEnv(root = process.cwd()): AgentEnv {
  loadEnvFiles(root);
  return process.env as AgentEnv;
}
