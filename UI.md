# UI.md — Studio Freight Inspired Design System

This file instructs the agent on visual design, layout, typography, motion, and component structure. Read this alongside AGENT.md before touching any UI file.

---

## Visual Reference

Inspired by [studiofreight.com](https://studiofreight.com) — a high-craft, minimal, motion-forward studio site. The aesthetic is:

- Off-white / warm paper backgrounds with near-black type
- Large, confident editorial typography with tight tracking
- Generous whitespace, almost uncomfortable amounts of it
- Subtle but precise animations — nothing decorative, everything purposeful
- Navigation that feels sparse and architectural
- Grid-based layouts that break the grid intentionally at hero moments

---

## Token System

### Colors

```ts
// src/styles/tokens.ts
export const colors = {
  background:   "#FEFDFC",   // warm off-white — the base canvas
  surface:      "#F2F0ED",   // slightly darker for cards and sections
  border:       "#E0DDDA",   // hairline dividers
  textPrimary:  "#0F0E0D",   // near-black
  textSecondary:"#6B6762",   // muted secondary labels
  accent:       "#0F0E0D",   // same as text — no color accent, contrast is the accent
  inverse:      "#0F0E0D",   // dark sections use this as bg
  inverseText:  "#FEFDFC",   // text on dark sections
} as const;
```

No bright accent colors. Contrast and scale do the work color usually does.

### Typography

```css
/* In your global CSS or tailwind config */

/* Display — used for hero headings, section titles */
font-family: 'Editorial New', 'Playfair Display', Georgia, serif;
/* Body — used for all copy, labels, UI text */
font-family: 'Suisse Int\'l', 'Inter', system-ui, sans-serif;
/* Mono — used for tags, metadata, counters */
font-family: 'Suisse Int\'l Mono', 'JetBrains Mono', monospace;
```

**Google Fonts approximation (free):**
```html
<!-- in index.html -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Hero | `clamp(4rem, 10vw, 9rem)` | 400 | `-0.03em` |
| H1 | `clamp(2.5rem, 5vw, 4.5rem)` | 400 | `-0.02em` |
| H2 | `2rem` | 400 | `-0.01em` |
| Body | `1rem` | 300 | `0` |
| Label | `0.75rem` | 500 | `0.08em` uppercase |
| Mono | `0.75rem` | 400 | `0.05em` |

### Spacing

Use an 8px base grid. Key spacings:

```css
--space-xs:   8px;
--space-sm:  16px;
--space-md:  32px;
--space-lg:  64px;
--space-xl: 128px;
--space-2xl: 192px;
```

Section padding: `clamp(64px, 10vw, 192px)` top and bottom.

---

## Layout

### Grid

```css
.grid-base {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 0 clamp(24px, 5vw, 80px);
}
```

### Breakpoints

```ts
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};
```

---

## Component Specs

### Navigation

```
[LOGO MARK]                    [Work]  [Info]  [News]    [Contact →]
```

- Fixed to top, full width
- Background: transparent initially, `#FEFDFC` on scroll with a `1px` bottom border in `#E0DDDA`
- Logo: small wordmark or mark on the left, ~24px tall
- Links: `0.75rem` uppercase label weight, `0.08em` tracking, no underline
- Contact: subtle right-aligned CTA, same size, no button styling
- Mobile: hamburger collapses to a full-screen overlay menu

```tsx
// src/components/ui/Nav.tsx
// Scroll behavior:
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 20);
  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);
```

### Hero Section

```
┌─────────────────────────────────────────────────┐
│                                                  │
│                                                  │
│   Moving                                         │
│   Missions                                       │
│   Forward                                        │
│                                                  │
│                              [scroll indicator ↓]│
└─────────────────────────────────────────────────┘
```

- Full viewport height (`100svh`)
- Headline: hero scale, serif, left-aligned, bottom 1/3 of the viewport
- No subheadline cluttering the space — let the type breathe
- Scroll indicator: small mono label + animated arrow, bottom right
- Background: flat `#FEFDFC`, no gradients, no images behind the text

```tsx
// src/pages/HomePage.tsx — hero motion
// Use framer-motion for the headline entrance:
// Each word slides up from 40px below with staggered delay (0.1s per word)
// Opacity 0 → 1 over 0.6s ease-out
```

### Work / Project Grid

```
┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │
│   [PROJECT IMG]  │  │   [PROJECT IMG]  │
│                  │  │                  │
│ Project Name     │  │ Project Name     │
│ Category · Year  │  │ Category · Year  │
└──────────────────┘  └──────────────────┘
```

- 2-column on desktop, 1-column on mobile
- No card borders or shadows — images float on the background
- On hover: image scales `1.02`, transition `0.4s ease`
- Project name: H2 weight 400 serif
- Metadata: mono label, muted color
- Lazy load all images with a blur-up placeholder

### Section Dividers

Use a single `1px` horizontal rule in `#E0DDDA` with a small label eyebrow above it:

```tsx
<div className="section-header">
  <span className="label">02 — Selected Work</span>
  <hr />
</div>
```

Never use bold decorative dividers or colored section breaks.

### Footer

```
┌─────────────────────────────────────────────────┐
│ LOGO          Work  Info  News  Contact          │
│                                                  │
│ ©2026 / Terms      IG / LI                       │
└─────────────────────────────────────────────────┘
```

- Dark section: background `#0F0E0D`, text `#FEFDFC`
- Two-row layout: nav links top, legal + social bottom
- All text: label scale, muted opacity on secondary items

---

## Motion & Animation

Install Framer Motion:

```bash
npm install framer-motion
```

### Principles

- Every animation has a purpose — reveals content, confirms interaction, or guides attention
- Default easing: `[0.25, 0.1, 0.25, 1]` (ease)
- Default duration: `0.5s–0.7s` for reveals, `0.2s–0.3s` for interactions
- Never loop ambient animations — they distract
- Always respect `prefers-reduced-motion`

```ts
// src/utils/motion.ts
export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export const respectReducedMotion = {
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    animation: "none",
  },
};
```

### Scroll-triggered reveals

Use Framer Motion's `whileInView` for all below-fold content:

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-10%" }}
  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
>
  {children}
</motion.div>
```

### Page transitions

Wrap routes in a shared layout with an exit animation:

```tsx
// Fade out current page (0.3s), fade in next page (0.5s)
// Use AnimatePresence from framer-motion around your Routes
```

### Cursor (optional, desktop only)

A custom cursor dot (`8px` circle, `#0F0E0D`) that follows the mouse with `0.1s` lag. On hoverable elements it expands to `40px` and inverts. Skip on touch devices.

---

## Page Structure

### Home (`/`)

1. Nav
2. Hero — full viewport, large headline
3. Selected Work grid — 4–6 projects
4. Studio intro — one paragraph, left-aligned, large body text
5. Services list — horizontal scroll or simple stacked list
6. Footer

### Dashboard (`/dashboard`) — adapted for your app

1. Nav (authenticated state — show user avatar/email)
2. Stats row — 3–4 key metrics in large mono numbers
3. Recent activity feed — minimal list, timestamp in mono
4. Quick actions — sparse, text-only links not buttons

### Workflows (`/workflows`) — adapted for your app

1. Nav
2. Section header with label eyebrow
3. Workflow list — each item is a full-width row with name, status dot, last run time
4. Status dot: `8px` circle, green `#22C55E` active / muted inactive
5. No modal popups — expand inline on click

---

## Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FEFDFC",
        surface: "#F2F0ED",
        border: "#E0DDDA",
        primary: "#0F0E0D",
        muted: "#6B6762",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        hero: ["clamp(4rem,10vw,9rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        h1:   ["clamp(2.5rem,5vw,4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h2:   ["2rem",   { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        label:["0.75rem",{ lineHeight: "1",    letterSpacing: "0.08em" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## File Structure Additions

```
src/
├── components/
│   ├── ui/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── ProjectCard.tsx
│   │   └── Cursor.tsx          # custom cursor, desktop only
│   └── motion/
│       ├── FadeUp.tsx           # reusable scroll reveal wrapper
│       └── PageTransition.tsx
├── styles/
│   ├── globals.css
│   └── tokens.ts
```

---

## What to Tell Cline

Paste this prompt into Cline after it reads this file:

```
Read UI.md and AGENT.md. Build the full UI for this app:
- Global styles and Tailwind config from UI.md
- Nav component with scroll behavior
- Hero section with Framer Motion entrance animation
- Home page layout
- Dashboard page with placeholder stats and activity feed
- Workflows page with a placeholder workflow list
Use placeholder content throughout. Do not connect any APIs yet.
Respect prefers-reduced-motion in all animations.
```

---

## What This Is Not

- Not a dark mode design — keep it light
- Not a glassmorphism or gradient design
- Not a card-heavy dashboard — keep information density low
- Not bold color — the restraint is the point
