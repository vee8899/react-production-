import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const commands = [
  [resolve('node_modules/supabase/dist/supabase.js'), 'test', 'db', '--workdir', process.env.SUPABASE_WORKDIR ?? process.cwd()],
  ['--import', 'tsx', 'scripts/test-ingestion-database.ts'],
  ['--import', 'tsx', 'scripts/test-operational-automation.ts'],
];
for (const args of commands) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
