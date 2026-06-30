# UIFIX2.md — Stats, Work Section & Order Fixes

Read alongside UIFIX.md, UI.md, and CONTENT.md.
Apply fixes ONE AT A TIME. Screenshot after each fix before moving to the next.

---

## Fix A — Remove Work Grid Section

The work/case studies section is not needed at this stage.
Remove it entirely from HomePage.tsx.

### Cline prompt
```
Read UIFIX2.md Fix A.

Remove the Work / Case Studies section entirely from HomePage.tsx.
This is the section with the eyebrow "03 — WORK" containing 
project cards (Lead Engine, Tenant Portal Sync, etc).

After removing it, renumber the remaining section eyebrows 
in order:

01 — WHAT WE DO
02 — SERVICES  
03 — PROCESS
04 — BY THE NUMBERS

Do not change any content or styling in the remaining sections.
Do not remove any other section.
Screenshot the full page and verify the section order is correct.
```

---

## Fix B — Stats Row Layout

### Problems
- Four stats are not in a horizontal row — they are overlapping 
  or wrapping incorrectly
- Numbers are colliding with each other
- Fourth stat is dropping to a new line below the others
- Font size is too large for the available width causing overflow

### Exact fix

```css
/* Stats row container */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  width: 100%;
  padding: 0 clamp(24px, 5vw, 80px);
}

/* Each stat cell */
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 32px; /* breathing room between stats */
  border-right: 1px solid #E0DDDA; /* hairline divider between stats */
}

.stat-item:last-child {
  border-right: none;
  padding-right: 0;
}

/* Stat number */
.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(2rem, 4vw, 3.5rem); /* scale DOWN from current size */
  font-weight: 400;
  color: #0F0E0D;
  line-height: 1;
  letter-spacing: -0.02em;
  display: block;
}

/* Stat label */
.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6B6762;
  display: block;
}
```

### Mobile behavior
```css
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
  
  .stat-item {
    border-right: none;
    padding-right: 0;
  }
}
```

### Stat content (exact values and labels)
```
10,000+   —  RECORDS AUTOMATED MONTHLY
98%       —  WORKFLOW SUCCESS RATE
40hrs     —  SAVED PER CLIENT PER MONTH
< 1s      —  AVERAGE WORKFLOW RESPONSE TIME
```

### Cline prompt
```
Read UIFIX2.md Fix B. Fix only the Stats / By The Numbers section 
in HomePage.tsx.

1. Stats row must be a 4-column CSS grid — one stat per column
   grid-template-columns: repeat(4, 1fr)
2. Each stat: number on top, label below, flex-direction column
3. Stat number font size: clamp(2rem, 4vw, 3.5rem) — scale it DOWN
   so all four fit on one row without overflow or collision
4. Font family for numbers: JetBrains Mono or monospace
5. Font weight: 400 — not bold
6. Color: #0F0E0D for numbers, #6B6762 for labels
7. Hairline divider 1px #E0DDDA between each stat (border-right 
   on each item except the last)
8. Mobile: 2x2 grid instead of 4 columns
9. Stat values and labels must match exactly:
   - 10,000+ / RECORDS AUTOMATED MONTHLY
   - 98% / WORKFLOW SUCCESS RATE  
   - 40hrs / SAVED PER CLIENT PER MONTH
   - < 1s / AVERAGE WORKFLOW RESPONSE TIME
10. Section eyebrow: "04 — BY THE NUMBERS" (renumbered after 
    work section removed)
11. Section padding: clamp(64px, 10vw, 192px) top and bottom

Do not touch any other section.
Screenshot and verify all four stats are on one horizontal row 
before finishing.
```

---

## Fix C — Verify Final Section Order

After Fix A and Fix B are applied, confirm the homepage 
sections appear in this exact order top to bottom:

```
1. Nav (fixed)
2. Hero — "Automating Real Estate. End to End."
3. 01 — WHAT WE DO
4. 02 — SERVICES
5. 03 — PROCESS
6. 04 — BY THE NUMBERS
7. Footer
```

### Cline prompt
```
Read UIFIX2.md Fix C.

Check HomePage.tsx and confirm the sections appear in this 
exact order:
1. Hero
2. 01 — WHAT WE DO
3. 02 — SERVICES
4. 03 — PROCESS
5. 04 — BY THE NUMBERS
6. Footer

If any section is out of order, reorder the JSX in HomePage.tsx 
to match this sequence exactly.
Do not change any content or styling — only reorder if needed.
Screenshot the full page scrolled from top to bottom and verify.
```

---

## Verification Checklist

- [ ] Work/case studies section is completely removed
- [ ] Sections are numbered 01 through 04 in correct order
- [ ] Stats row shows all 4 numbers on one horizontal line
- [ ] No stats are overlapping or dropping to a second row
- [ ] Stat numbers are mono font, weight 400, not bold
- [ ] Hairline dividers between stats
- [ ] Stats go 2x2 on mobile
- [ ] Footer follows immediately after stats
