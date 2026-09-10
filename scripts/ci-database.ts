import { randomUUID } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve('.ci-database');
const cli = resolve('node_modules/supabase/dist/supabase.js');
const run = (args: string[], env = process.env) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (result.error || result.status !== 0) throw new Error(`Local database command failed: ${args.slice(1, 3).join(' ')}`);
};
const stop = (directory: string) => {
  if (!directory.startsWith(root + '/') && !directory.startsWith(root + '\\')) throw new Error('Expected isolated workspace');
  run([cli, 'stop', '--workdir', directory, '--no-backup']);
};
if (process.argv.includes('--stop')) {
  for (const entry of existsSync(root) ? readdirSync(root, { withFileTypes: true }) : []) {
    if (entry.isDirectory() && /^phase3-[a-f0-9-]+$/.test(entry.name)) stop(join(root, entry.name));
  }
} else {
  const server = createServer();
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Unable to reserve local database port');
  const port = address.port;
  await new Promise<void>((done) => server.close(() => done()));
  const id = `phase3-${randomUUID()}`;
  const directory = join(root, id);
  mkdirSync(join(directory, 'supabase'), { recursive: true });
  cpSync('supabase/migrations', join(directory, 'supabase/migrations'), { recursive: true });
  cpSync('supabase/tests', join(directory, 'supabase/tests'), { recursive: true });
  writeFileSync(join(directory, 'supabase/config.toml'), `project_id = "${id}"\n[db]\nport = ${port}\nmajor_version = 17\n[db.seed]\nenabled = false\n`);
  try {
    run([cli, '--version']);
    run([cli, 'db', 'start', '--workdir', directory]);
    run([cli, 'migration', 'up', '--local', '--workdir', directory]);
    run(['--import', 'tsx', 'scripts/test-database.ts'], {
      ...process.env, SUPABASE_WORKDIR: directory,
      LOCAL_INGEST_DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`,
    });
  } finally {
    stop(directory);
  }
}
