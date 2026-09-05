# Reference records

This folder contains historical design notes and dated maintenance evidence. Original observation dates and tested revisions are not recorded in several older files. Those files are retained for context, not as current requirements or release evidence.

| Record | Treatment and current entry point |
| --- | --- |
| [Site audit](audit_markdown.md) | Historical observations; reconcile individual findings against current code. Use [public landing specification](../specs/public-landing-experience.md) and [activity specification](../specs/workflow-activity.md). |
| [Dashboard notes](DASHBOARD.md) | Historical interface notes; use [dashboard specification](../specs/authenticated-client-dashboard.md). |
| [UI notes](UI.md) | Historical design/page inventory; use [styling ADR](../adrs/styling.md) and current page source. |
| [Debug notes](DEBUG.md) | Superseded by the [debugging runbook](../runbooks/debugging.md). |
| [Project scaffold record](CHANGELOG.md) | Visual Studio/create-vite origin notes, not an ongoing product changelog. |
| [Documentation maintenance, 2026-09-05](documentation-maintenance-2026-09-05.md) | Local evidence for the documentation/generator changes only; no runtime-hardening or production acceptance. |

Preserve historical findings as observations rather than updating them to look as though the original audit saw today's implementation. For a new check, record its date, exact revision, environment, command or procedure, and result separately. Never use an old screenshot, count, or checklist as proof for a new release.
