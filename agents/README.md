# Multi-agent coding system (agents/)

A LangGraph-based multi-agent pipeline for generating and reviewing code. It
runs outside the browser bundle and is consumed as a library by scripts and
other server-side tooling.

## Topology

```
task → orchestrator (Claude) → coder (DeepSeek V4) → reviewer (Claude) → END (approved)
                                             ↑_______________↓ (changes, up to AGENTS_MAX_ATTEMPTS)
```

| Node | Model (default) | Responsibility |
| --- | --- | --- |
| `orchestrator` | `anthropic/claude-opus-4-8` | Decomposes the task into a plan and coding spec |
| `coder` | `deepseek/deepseek-v4-flash` | Produces the implementation as fenced code blocks; on revision passes emits `git diff` patches or only the changed files |
| `reviewer` | `anthropic/claude-opus-4-8` | Approves or returns actionable revision comments |

The reviewer routes back to the coder while its verdict is `changes` and the
attempt counter is below `AGENTS_MAX_ATTEMPTS`. The graph always terminates.
If planning finds a conflict between authored documentation and implementation,
it returns `decision_required` and stops before the coder runs.

## Alignment and context

`runCodingAgentsWithRepoContext` loads the repository-wide change contract from
`AGENT.md`, then adds authored documentation and source files that match the
task. The orchestrator must declare verification, exceptions, and whether
documentation is aligned before implementation can begin. A documentation
conflict requires an explicit human decision; the pipeline must not choose a
source of truth or generate a patch on its own.

### Cost controls

- **Prompt caching**: Anthropic-backed roles (`anthropic` provider) tag their
  system prompts with `cache_control`, so repeated revision iterations reuse
  the cached prefix instead of re-billing it. DeepSeek's endpoint caches
  automatically, so the worker side needs no extra configuration.
- **Diff revisions**: on a revision pass the worker emits ` ```diff ` patches
  (applied with jsdiff) or full rewrites only for files that changed. First
  pass always returns full files. Unchanged files are not re-emitted.

## Library API

```ts
import { runCodingAgents, runCodingAgentsWithRepoContext, loadConfig } from "./agents/index.ts";

const config = loadConfig(); // reads env vars

const result = await runCodingAgentsWithRepoContext({ task: "Add an ROI test" }, config);

console.log(result.verdict); // "approve" | "changes"
console.log(result.files);   // file paths parsed from the coder's code fences
console.log(result.code);    // the generated implementation
```

Exports:

- `runCodingAgents(input, config?)` — run the graph; `config` falls back to env.
- `runCodingAgentsWithRepoContext(input, config?, root?)` — augments context
  with `AGENT.md`, task-relevant authored documentation, and ranked source
  files from `outputs/repo-index/files.json` when present.
- `buildCodingAgents(config)` / `createCodingAgents(config)` — compile the graph
  for streaming or checkpointed use.
- `loadConfig(env?)`, `parseModelSpec(spec)`, `createModel(spec, env)` — provider
  configuration helpers.
- `loadRepoContext(root?, task?)` — loads the alignment contract plus
  task-relevant documentation and source context.
- `parseCodeBlocks(content)` — parses ` ```lang file:path ` fences.
- `parsePatches(content)` / `patchTargetFile(patch)` / `applyImplementation(content, current)`
  — parse and apply ` ```diff ` revision patches.

## Configuration

Configuration is environment driven. See `docs/environments.md` for the full
variable table. Copy the keys below into `.env.local` (gitignored); the agents
library auto-loads `.env` and `.env.local` on startup via `loadEnv()`.
Existing shell environment variables always take precedence over the file.

```env
ORCHESTRATOR_MODEL=anthropic/claude-opus-4-8
CODING_MODEL=deepseek/deepseek-v4-flash
REVIEWER_MODEL=anthropic/claude-opus-4-8
ANTHROPIC_API_KEY=...
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com
AGENTS_MAX_ATTEMPTS=2
```

Supported providers are `anthropic` (via `@langchain/anthropic`) and `deepseek`
(via the OpenAI-compatible client against `DEEPSEEK_BASE_URL`). Swap any role
to another provider by changing its `provider/model-id`.

## Verification

```powershell
npm.cmd run agents:typecheck
npm.cmd run test -- --run agents/codingAgents.test.ts
```

The test suite drives the full graph with a fake model (no API keys needed).
To run a real pass against a configured environment:

```powershell
npm.cmd run agents:demo "Add a unit test for the ROI calculator in src/lib"
```
