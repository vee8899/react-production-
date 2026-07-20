# Runbook: production migration dry-run

Use this before applying production migrations. The dry-run is evidence only;
it must not apply changes.

## Procedure

```powershell
$ProjectRef = "your-production-project-ref"
$ReleaseSha = (git rev-parse HEAD).Trim()

if ((git status --porcelain) -ne "") { throw "Stop: working tree is not clean" }

npx supabase login
npx supabase link --project-ref $ProjectRef
npx supabase db push --dry-run --linked
```

## Review

- Confirm the project ref is the approved production project.
- Confirm the output includes the expected migration versions.
- Confirm no unexpected destructive operation appears.
- Confirm RLS, grants, and `security definer` changes were reviewed.
- Record the reviewer and the explicit go/no-go decision.

## Evidence

Record the project ref, release SHA, command output, migration versions, review
decision, reviewer, and timestamp in the release record.
