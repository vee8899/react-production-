# CONTENT.md — Real Estate Automation Studio

This file defines all copy, section structure, and content decisions for the public landing page. Read alongside UI.md and AGENT.md before touching any page content.

---

## Brand

**Studio name:** STUDIO (placeholder — replace when decided)
**Tagline:** Automating Real Estate. End to End.
**Voice:** Direct, technical, confident. No fluff. No adjectives that don't earn their place.

---

## Nav

```
STUDIO                    Work    Services    Contact →
```

Remove Dashboard and Workflows from the public nav — those are authenticated routes only. Public nav has three links: Work, Services, Contact.

---

## Hero Section

**Headline:**
```
Automating
Real Estate.
End to End.
```

**Sub-label (small mono text, bottom left near headline):**
```
Private client automation studio
```

**Scroll indicator:** bottom right, as currently built.

No body copy in the hero. The headline does the work.

---

## Section 01 — What We Do

**Eyebrow:** `01 — WHAT WE DO`

**Body (large, single paragraph, left-aligned):**
```
We build automation systems for real estate professionals —
agents, brokerages, and property managers — that eliminate
manual work from their operations. Every workflow is custom
built, connected to their existing tools, and monitored in
real time.
```

---

## Section 02 — Services

**Eyebrow:** `02 — SERVICES`

Numbered list, same style as current services section:

| # | Service | Description |
|---|---|---|
| 01 | Lead Follow-Up | Automated email and SMS sequences triggered the moment a lead comes in. No manual outreach. |
| 02 | Listing Notifications | Instant alerts to buyers and tenants when a matching property hits the market. |
| 03 | Client Communication | Scheduled updates, check-ins, and document requests sent automatically at the right time. |
| 04 | CRM Sync | Keep your CRM, inbox, and calendar in sync without touching a single field manually. |
| 05 | Document Generation | Auto-generate contracts, proposals, and reports from your existing data. |
| 06 | Appointment Scheduling | Automated booking flows that confirm, remind, and follow up without back-and-forth. |
| 07 | Data Pipelines | Move data between your tools — portals, spreadsheets, databases — on a schedule or trigger. |
| 08 | Custom Workflows | Anything that happens more than once in your business can be automated. We build it. |

Each service is a full-width row with the number in mono, service name in serif, description in small body text below the name. Hairline divider between each row.

---

## Section 03 — How It Works

**Eyebrow:** `03 — PROCESS`

Three steps, displayed as a horizontal row on desktop, stacked on mobile:

```
01                      02                      03
Discovery               Build                   Monitor
─────────────────────   ─────────────────────   ─────────────────────
We map your current     We connect your          Every automation runs
operations and          tools and build          through our dashboard.
identify every          workflows tailored       You see what ran, when,
manual task that        to how you work.         and how many records
can be automated.       No templates.            were processed.
```

---

## Section 04 — Work / Case Studies

**Eyebrow:** `04 — WORK`

Placeholder project cards — same grid as currently built. Replace placeholder names with these:

| Project | Category | Year |
|---|---|---|
| Lead Engine | Brokerage Automation | 2026 |
| Tenant Portal Sync | Property Management | 2025 |
| Listing Alert System | Agent Automation | 2025 |
| Contract Autopilot | Document Automation | 2024 |

Keep IMAGE placeholders — real screenshots go here once client work is shareable.

---

## Section 05 — Stats

**Eyebrow:** `05 — BY THE NUMBERS`

Four numbers in large mono, same layout as dashboard stats row:

| Number | Label |
|---|---|
| 10,000+ | Records automated monthly |
| 98% | Workflow success rate |
| 40hrs | Saved per client per month |
| < 1s | Average workflow response time |

These are placeholder figures — replace with real numbers when available.

---

## Footer

```
STUDIO                    Work  Services  Contact

Automating real estate operations
for private clients worldwide.

©2026                     IG / LI
```

Dark section, same as currently built.

---

## What to Tell Cline

Paste this prompt into Cline after it reads this file:

```
Read CONTENT.md, UI.md, and AGENT.md.

Update the public landing page (HomePage.tsx) with the following changes:

1. Hero headline: "Automating Real Estate. End to End." 
   with a small mono sub-label "Private client automation studio"

2. Section 01 — What We Do: single large paragraph as written in CONTENT.md

3. Section 02 — Services: replace the existing 4 services with the 8 
   services listed in CONTENT.md. Same numbered row style with hairline 
   dividers, add a short description line below each service name in 
   small body text.

4. Section 03 — Process: new section with 3 horizontal steps as described 
   in CONTENT.md. Step number in mono, title in serif, body in small sans.

5. Section 04 — Work: update the 4 project card names and categories 
   from CONTENT.md. Keep IMAGE placeholders and existing grid layout.

6. Section 05 — Stats: new section with 4 large mono numbers and labels 
   from CONTENT.md.

7. Nav: remove Dashboard and Workflows links from the public nav. 
   Public nav should only show Work, Services, Contact.

8. Footer: update copy as written in CONTENT.md.

Do not change any styling, fonts, colors, spacing, or animations.
Only update text content and add the two new sections (Process, Stats)
following the exact same visual patterns already in use.
```

---

## Notes for Later

- Replace IMAGE placeholders with real client work screenshots when available
- Replace stat numbers with real figures from your dashboard data
- Add a contact form or Calendly embed to the Contact link when ready
- Consider a password-protected client login entry point separate from the main nav
