# SECTIONS.md — Integrations, ROI Calculator & FAQ

Shelved until UI fixes are complete. Read alongside AGENT.md, UI.md, and CONTENT.md before implementing. These three sections are added to the public landing page (HomePage.tsx) after existing sections.

---

## Section Order on Landing Page

Current sections:
1. Hero
2. What We Do
3. Services
4. Process
5. Work Grid
6. Stats

Add after Stats:
7. **Integrations Orbit** ← new
8. **ROI Calculator** ← new
9. **FAQ** ← new
10. Footer

---

## Section 07 — Integrations Orbit

### Concept
An animated orbit diagram with the studio brand in the center and integration logos rotating around it on a circular path. Logos stay upright while the ring rotates. Built with Framer Motion.

### Design rules
- Background: `#FEFDFC` — no section background color change
- All logos: monochrome `#0F0E0D` — no brand colors
- Center card: same surface color `#F2F0ED`, subtle `1px` border `#E0DDDA`
- Logo size: `32px × 32px`
- Orbit ring: dashed circle, `1px` stroke, `#E0DDDA`
- Section eyebrow: `07 — INTEGRATIONS`
- Heading above orbit: `Works with the tools your business already uses.`

### Integrations to include (8 total)
Position them evenly at 45° intervals around the orbit:

| Logo | Label | Position |
|---|---|---|
| Gmail | Gmail | 0° (top) |
| Google Calendar | Calendar | 45° |
| Google Sheets | Sheets | 90° (right) |
| Google Docs | Docs | 135° |
| WhatsApp | WhatsApp | 180° (bottom) |
| Telegram | Telegram | 225° |
| Slack | Slack | 270° (left) |
| Outlook | Outlook | 315° |

### Logo sources (SVG icons — use SimpleIcons or similar)
```
Gmail:          https://cdn.simpleicons.org/gmail/0F0E0D
Google Calendar: https://cdn.simpleicons.org/googlecalendar/0F0E0D
Google Sheets:  https://cdn.simpleicons.org/googlesheets/0F0E0D
Google Docs:    https://cdn.simpleicons.org/googledocs/0F0E0D
WhatsApp:       https://cdn.simpleicons.org/whatsapp/0F0E0D
Telegram:       https://cdn.simpleicons.org/telegram/0F0E0D
Slack:          https://cdn.simpleicons.org/slack/0F0E0D
Outlook:        https://cdn.simpleicons.org/microsoftoutlook/0F0E0D
```

### Center card content
```
[STUDIO]
Private Automation Studio
```

### Animation spec
```ts
// Outer ring rotates 360° continuously
// Duration: 20s linear infinite
// Logos counter-rotate to stay upright
// On hover: pause rotation

const orbitVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

const logoVariants = {
  animate: {
    rotate: -360, // counter-rotate to stay upright
    transition: {
      duration: 20,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};
```

### Component structure
```tsx
// src/components/features/IntegrationsOrbit.tsx
// Layout:
// - SectionHeader eyebrow + divider
// - Large heading centered above orbit
// - Orbit diagram centered, ~480px diameter on desktop, ~320px on mobile
// - Each logo positioned absolutely on the ring circumference
// - Center card absolutely centered inside the ring
// - Respect prefers-reduced-motion: if reduced motion, show static ring no animation
```

---

## Section 08 — ROI Calculator

### Concept
Interactive slider-based calculator. Client inputs their workflow numbers and sees live output of time and money saved. Built in React with useState — no external library needed.

### Design rules
- Background: `#F2F0ED` — slight surface tint to visually separate this section
- Section eyebrow: `08 — ROI CALCULATOR`
- Heading: `See how much you save.`
- Slider track: `#E0DDDA`, filled portion: `#0F0E0D`
- Output numbers: large mono font, same scale as dashboard stats
- Labels: `0.75rem` uppercase Inter, `#6B6762`
- No colored buttons or highlights

### Inputs

| Input | Label | Min | Max | Default | Step | Unit |
|---|---|---|---|---|---|---|
| Leads per month | Leads per month | 10 | 500 | 80 | 10 | leads |
| Follow-up time per lead | Minutes per follow-up | 5 | 60 | 20 | 5 | min |
| Staff cost | Staff hourly cost | 90 | 500 | 150 | 10 | ₹/hr |
| Messages per day | Messages sent daily | 10 | 200 | 50 | 10 | msgs |

### Outputs (computed live)

```ts
const hoursPerMonth = (leadsPerMonth * followUpMins) / 60;
const costSavedPerYear = hoursPerMonth * 12 * staffCost;
const leadsNotDropped = Math.round(leadsPerMonth * 0.35); // 35% of leads drop without automation
const messagesAutomated = messagesPerDay * 30;
```

| Output | Label | Format |
|---|---|---|
| `hoursPerMonth` | Hours saved per month | `{n} hrs` |
| `costSavedPerYear` | Cost saved per year | `₹{n}` |
| `leadsNotDropped` | Leads no longer dropped | `{n} leads` |
| `messagesAutomated` | Messages automated monthly | `{n} msgs` |

### Layout
```
[Section header]

See how much you save.

┌─────────────────────────────────┬──────────────────────┐
│  INPUTS                         │  YOU SAVE            │
│                                 │                      │
│  Leads per month         80     │  247 hrs             │
│  ████████░░░░░░░░░░░░░░░        │  HOURS PER MONTH     │
│                                 │                      │
│  Minutes per follow-up   20     │  ₹4,45,000           │
│  ████░░░░░░░░░░░░░░░░░░░        │  COST SAVED PER YEAR │
│                                 │                      │
│  Staff hourly cost    ₹150      │  28 leads            │
│  ██░░░░░░░░░░░░░░░░░░░░░        │  NOT DROPPED         │
│                                 │                      │
│  Messages per day        50     │  1,500 msgs          │
│  ████░░░░░░░░░░░░░░░░░░░        │  AUTOMATED MONTHLY   │
└─────────────────────────────────┴──────────────────────┘
```

Two column layout on desktop, stacked on mobile (inputs top, outputs bottom).

### Component structure
```tsx
// src/components/features/ROICalculator.tsx
// Use useState for all 4 inputs
// Compute outputs inline — no useEffect needed
// Custom slider component styled to match design system
// Output numbers animate on change using Framer Motion's 
// useSpring or simple CSS transition
// Respect prefers-reduced-motion: disable number animation if reduced motion
```

---

## Section 09 — FAQ

### Concept
Four questions covering the four concern categories. Each expands inline on click to reveal the answer. No modals, no accordions from external libraries — pure React useState toggle.

### Design rules
- Background: `#FEFDFC`
- Section eyebrow: `09 — FAQ`
- Question text: `1.25rem` serif, weight 400
- Answer text: `1rem` body, `#6B6762`
- Expand indicator: `+` collapses to `−` on open
- Hairline divider between each item: `1px #E0DDDA`
- No color changes on open/close — only the answer reveals

### Questions and answers

**Security**
```
Q: Is my client data secure?

A: Yes. All data is stored in an isolated database with row-level 
security — meaning each client can only ever access their own data. 
Workflows run on private infrastructure and no client data is shared 
across accounts or stored in third-party automation platforms.
```

**Integration**
```
Q: Do I need to change the tools I already use?

A: No. We connect to the tools you already have — Gmail, WhatsApp, 
Google Sheets, Outlook, Slack, Telegram, and more. There is no 
migration, no new software to learn, and no disruption to your 
existing workflow. We build around how you already work.
```

**Productivity**
```
Q: How much time can I realistically save per month?

A: Most real estate clients save between 40 and 120 hours per month 
depending on lead volume and how many manual tasks are automated. 
Follow-up sequences, message sending, and data entry are typically 
the highest-impact areas. Use the calculator above to estimate your 
specific savings.
```

**Use cases**
```
Q: What real estate tasks can actually be automated?

A: Lead follow-up sequences, listing alerts to buyers, WhatsApp and 
email communication, appointment reminders, CRM data entry, document 
generation, and daily reporting. If it happens more than once and 
follows a pattern, it can be automated.
```

### Component structure
```tsx
// src/components/features/FAQ.tsx
// useState to track which item is open (index or null)
// Click toggles open/closed
// Answer reveals with Framer Motion AnimatePresence height animation
// Only one item open at a time
// Respect prefers-reduced-motion: instant show/hide if reduced motion
```

---

## Cline Prompt — Integrations Orbit

```
Read SECTIONS.md. Build Section 07 — Integrations Orbit and add it 
to HomePage.tsx after the Stats section.

Requirements:
- Use Framer Motion for the rotation animation
- 8 logos positioned evenly on a circular orbit ring
- All logos monochrome #0F0E0D using SimpleIcons CDN URLs from SECTIONS.md
- Center card shows "STUDIO" and "Private Automation Studio"
- Orbit ring is a dashed circle, 1px stroke, #E0DDDA
- Background stays #FEFDFC — no section background change
- Logos counter-rotate to stay upright while ring spins
- Pause on hover
- Respect prefers-reduced-motion
- Section eyebrow: "07 — INTEGRATIONS"
- Heading: "Works with the tools your business already uses."
- Do not change any other section or styling
```

---

## Cline Prompt — ROI Calculator

```
Read SECTIONS.md. Build Section 08 — ROI Calculator and add it 
to HomePage.tsx after the Integrations Orbit section.

Requirements:
- 4 sliders: leads per month, minutes per follow-up, 
  staff hourly cost (₹90-₹500), messages per day
- 4 live outputs computed from inputs as specified in SECTIONS.md
- Two column layout desktop, stacked mobile
- Slider track #E0DDDA, filled #0F0E0D, no default browser styling
- Output numbers in large mono font matching dashboard stats scale
- Labels 0.75rem uppercase #6B6762
- Section background #F2F0ED to visually separate
- Section eyebrow: "08 — ROI CALCULATOR"
- Heading: "See how much you save."
- Respect prefers-reduced-motion
- Do not change any other section or styling
```

---

## Cline Prompt — FAQ

```
Read SECTIONS.md. Build Section 09 — FAQ and add it to HomePage.tsx 
after the ROI Calculator section.

Requirements:
- 4 questions exactly as written in SECTIONS.md
- Click to expand/collapse inline — no modals
- Only one item open at a time
- Framer Motion AnimatePresence for height animation
- + indicator becomes − when open
- Hairline divider 1px #E0DDDA between items
- Question text 1.25rem serif weight 400, color #0F0E0D
- Answer text 1rem body #6B6762
- Background #FEFDFC
- Section eyebrow: "09 — FAQ"
- Respect prefers-reduced-motion
- Do not change any other section or styling
```

---

## Notes

- Run each Cline prompt separately in order — orbit first, then calculator, then FAQ
- After each section is built, screenshot and verify before running the next prompt
- Replace "STUDIO" in the orbit center card with the real studio name when decided
- FAQ answer for productivity references the calculator above — keep that ordering
- ROI calculator uses ₹ symbol throughout — confirm font renders it correctly before deploying
