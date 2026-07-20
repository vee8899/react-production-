# Site Audit: react-production.pages.dev

## Brand
- Nav: "STUDIO"
- Footer: "PRIMESTATE SYSTEMS"
- Title tag: "Studio — React" (dev artifact, fix first)
- In-app title persists same issue

## Marketing Site — Working
- Editorial serif headlines + monospace micro-labels + hairline rules + off-white/black palette = deliberate, premium, consistent through login page
- Numbered sections (01–05) give rhythm
- ROI calculator: sliders (workload, handling time), selectable automation modules, pricing tiers, 4 currencies, adjustable labor rate. Copy: "additional productive capacity, not workforce reduction", capped coverage, explicit disclaimers. Best part of site.
- Copy tight: "We connect your tools and build workflows tailored to how you work. No templates."
- Integration caveat: "availability depends on your systems, permissions, and implementation scope" — trust signal

## Marketing Site — Fix
1. Brand identity: pick one name, fix title tag
2. "Work" nav scrolls page, no case studies/client logos/testimonials. At ~$10k/yr price point, buyers need proof. Add 2–3 anonymized snapshots: industry → manual problem → workflow built → hours saved
3. "Visible — activity in client dashboard" is core selling point, zero imagery on entire site. Add one dashboard screenshot/mock to make offer tangible
4. No end-of-page conversion point. After calculator shows "$1,669 estimated annual savings", no CTA. Add "Book a discovery call" form/email/scheduling link
5. Polish: "System Data synchronization" inconsistent caps vs "Business Insights"; hero dead space above headline (striking but could carry subtle visual); FAQ only 4 questions, add pricing/engagement-model question

## Dashboard (demo@northstar.example / stackoverflow)
- 4 stats: 8 runs/30d, 75% success, 75 records, 4s avg
- Grid: 8 service modules all "Active"
- Subscribed: "Real Estate Operations" module card
- Workflows: 9 demo workflows, status dots, category tags, record counts, durations, relative timestamps
- Design language survives login (rare), editorial typography consistent, demo data coherent (real-estate vertical, lead enrichment, listing notifications)

## Dashboard — Bugs/Gaps (priority)
1. `/activity` nav item → silent redirect to `/dashboard`. Dead link. Clients will click.
2. 75% success rate = 2 failed/partial of 8. No failures view, no per-run detail, no error reason. Workflow rows not clickable. Core gap: product pitch is "operational visibility", dashboard says something went wrong, gives zero way to find what. Run history with per-run status (success/partial/failed + reason) = single most important feature to add.
3. Subscribed module card: "Real-estate operational metrics are unavailable" — no explanation, no retry, no next step. In demo looks like error. Populate with demo metrics or frame empty state intentionally ("metrics sync pending", "connects after first workflow run").
4. Green status dot on "Never run" workflow. Green implies healthy. "Never run" = neutral gray.
5. No "connected tools" surface. Marketing promises "connect to your existing tools" — nowhere in app to see what's connected (Gmail? Sheets? CRM?). Add connections page with status per integration.
6. Stats locked to 30-day window, no range switcher. No runs-over-time sparkline (thin black line chart fits aesthetic). All modules show "Active" with no subscribed-vs-available distinction — missed upsell surface. Title/brand issues persist in-app.

## Verdict
Marketing: aesthetic + calculator ahead of most small-studio sites, feels like a firm not a freelancer. Gap = credibility: fix naming, add proof, show dashboard, give clear next step.
Product: shell and design system genuinely good, but currently a *status display* not an *operations tool*. Fix activity route, add run-level drill-down with failure reasons, show connected integrations → product delivers on marketing promise.
