# Runbook: linting

With Node.js 24 and repository dependencies installed, run from the repository root:

```powershell
npm.cmd run lint
```

Exit code zero means ESLint passed under [eslint.config.js](../../eslint.config.js). Inspect any warnings as well as errors; do not call a run warning-free unless its output establishes that.

Fix actionable diagnostics in the smallest relevant scope and rerun the command. Do not add broad suppressions merely to obtain a pass. The command does not use --fix and is suitable for verification.

ESLint does not prove runtime behavior, database isolation, or GitHub Actions dependency semantics. Record the tested revision and result, and use the [testing](testing.md) and [type-checking](type-checking.md) procedures for their separate guarantees.
