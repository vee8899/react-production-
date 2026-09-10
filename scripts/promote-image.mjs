import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const sha = process.env.VERIFIED_SHA;
const digest = process.env.IMAGE_DIGEST;
if (!/^[a-f0-9]{40}$/.test(sha ?? '') || !/^sha256:[a-f0-9]{64}$/.test(digest ?? '')) {
  throw new Error('A verified commit SHA and image digest are required');
}
if (process.env.GITHUB_EVENT_NAME !== 'push' || process.env.GITHUB_REF !== 'refs/heads/main' || sha !== process.env.GITHUB_SHA) {
  throw new Error('Only the verified main push may promote an image');
}
// Run inside the workflow's publication lock. Re-read main after the build,
// immediately before changing latest; Actions concurrency is not FIFO.
const main = execFileSync('git', ['ls-remote', '--exit-code', 'origin', 'refs/heads/main'], { encoding: 'utf8' }).trim().split(/\s+/)[0];
const image = 'ghcr.io/vee8899/automation-platform';
if (main !== sha) {
  console.log('Main advanced; keeping the verified SHA tag without promoting latest.');
} else {
  execFileSync('docker', ['buildx', 'imagetools', 'create', '--tag', `${image}:latest`, `${image}@${digest}`], { stdio: 'inherit' });
  console.log('Promoted the verified current-main digest to latest.');
}
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
  `Verified commit: ${sha}\n\nImage: ${image}@${digest}\n\nLatest promoted: ${main === sha}\n`);
