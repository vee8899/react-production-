# UIFIX.md — Incremental Landing Page Layout Fixes

Read alongside UI.md, AGENT.md, and CONTENT.md before touching any file.
Apply fixes ONE SECTION AT A TIME. Screenshot and verify each fix before moving to the next.
Do not touch any section not listed in the current fix being applied.

---

## Fix Order

1. Hero section
2. What We Do section
3. Services section
4. Work grid
5. Process section
6. Global spacing and padding
7. Nav

---

## Fix 01 — Hero Section

### Problems
- Headline is not full viewport height
- Headline is floating upper right instead of bottom left
- Login card is overlapping the hero — should not exist in the hero
- Sub-label positioning is wrong
- Scroll indicator is misplaced

### Exact fix

```css
/* Hero must be exactly 100svh tall */
.hero {
  height: 100svh;
  width: 100%;
  position: relative;
  background: #FEFDFC;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* push content to bottom */
  padding: 0 clamp(24px, 5vw, 80px);
  padding-bottom: clamp(48px, 8vh, 96px);
}
```

### Headline positioning
```
- Headline sits in the BOTTOM THIRD of the viewport
- Left aligned
- No content in the top 60% of the hero except the nav
- Font size: clamp(4rem, 10vw, 9rem)
- Font weight: 400 — NOT bold
- Font family: Playfair Display, serif
- Color: #0F0E0D
- Line height: 0.95
- Letter spacing: -0.03em
```

### Sub-label
```
- Small mono text: "Private client automation studio"
- Font size: 0.75rem
- Letter spacing: 0.08em
- Uppercase
- Color: #6B6762
- Position: directly above the headline, margin-bottom: 16px
```

### Scroll indicator
```
- Position: fixed bottom right of hero
- "SCROLL" in mono 0.75rem uppercase
- Vertical line below the text, 1px #E0DDDA, height 48px
- Color: #6B6762
- No button styling
```

### Remove from hero
```
- Any card, modal, or login box overlapping the hero
- Any background image or gradient
- Any centered content layout
```

### Cline prompt
```
Read UIFIX.md Fix 01. Fix only the Hero section in HomePage.tsx.

1. Make the hero exactly 100svh tall with background #FEFDFC
2. Move the headline to the bottom third — use justify-content: flex-end 
   on the hero container with padding-bottom of at least 64px
3. Headline: font-weight 400, Playfair Display, clamp(4rem,10vw,9rem), 
   left aligned, color #0F0E0D, line-height 0.95, letter-spacing -0.03em
4. Sub-label "Private client automation studio" sits directly above 
   the headline in mono 0.75rem uppercase #6B6762
5. Scroll indicator bottom right: "SCROLL" mono text with a 1px 
   vertical line below it, color #6B6762
6. Remove any card, login box, or overlapping element from the hero
7. The top 60% of the hero should be completely empty except the nav

Do not touch any other section. Screenshot the hero and verify 
before moving to Fix 02.
```

---

## Fix 02 — What We Do Section

### Problems
- Text is too small and cramped
- Section is not wide enough — content compressed to center column
- Not enough whitespace above and below

### Exact fix

```
- Section padding: clamp(64px, 10vw, 192px) top and bottom
- Content width: max-width 800px, left aligned (not centered)
- Paragraph font size: clamp(1.25rem, 2.5vw, 1.75rem)
- Font family: Inter, sans-serif
- Font weight: 300
- Color: #0F0E0D
- Line height: 1.5
- Section eyebrow: "01 — WHAT WE DO" in 0.75rem mono uppercase #6B6762
- Hairline divider below eyebrow: 1px #E0DDDA, full width
- Space between divider and paragraph: 48px minimum
```

### Cline prompt
```
Read UIFIX.md Fix 02. Fix only the What We Do section in HomePage.tsx.

1. Section padding top and bottom: clamp(64px, 10vw, 192px)
2. Paragraph font size: clamp(1.25rem, 2.5vw, 1.75rem)
3. Font weight 300, Inter, color #0F0E0D, line-height 1.5
4. Max-width 800px, left aligned — not centered
5. Eyebrow "01 — WHAT WE DO" in 0.75rem mono uppercase #6B6762
6. Full width hairline divider 1px #E0DDDA below the eyebrow
7. 48px minimum gap between divider and paragraph text

Do not touch any other section. Screenshot and verify before Fix 03.
```

---

## Fix 03 — Services Section

### Problems
- Services list is collapsed and too small
- Numbers and service names are not properly sized
- Missing description text below each service name
- Dividers between items are missing or too faint
- Section is not full width

### Exact fix

```
- Section padding: clamp(64px, 10vw, 192px) top and bottom
- Each service row: full viewport width, padding 0 clamp(24px, 5vw, 80px)
- Row height: minimum 80px, vertically centered content
- Hairline divider: 1px #E0DDDA above each row (and below last row)
- Number: 0.75rem mono, #6B6762, margin-right 32px, min-width 32px
- Service name: clamp(1.5rem, 3vw, 2.5rem) Playfair Display weight 400 #0F0E0D
- Description: 0.875rem Inter weight 300 #6B6762, margin-top 4px
- Layout: number left, service name + description center-left, full width row
```

### Services list (exact content)
```
01  Lead Follow-Up
    Automated email and SMS sequences triggered the moment a lead comes in.

02  Listing Notifications
    Instant alerts to buyers and tenants when a matching property hits the market.

03  Client Communication
    Scheduled updates, check-ins, and document requests sent automatically.

04  CRM Sync
    Keep your CRM, inbox, and calendar in sync without touching a field manually.

05  Document Generation
    Auto-generate contracts, proposals, and reports from your existing data.

06  Appointment Scheduling
    Automated booking flows that confirm, remind, and follow up without back-and-forth.

07  Data Pipelines
    Move data between your tools on a schedule or trigger.

08  Custom Workflows
    Anything that happens more than once in your business can be automated.
```

### Cline prompt
```
Read UIFIX.md Fix 03. Fix only the Services section in HomePage.tsx.

1. Each service is a full-width row with minimum height 80px
2. Hairline divider 1px #E0DDDA above each row and below the last row
3. Number: 0.75rem mono #6B6762, fixed width, left side
4. Service name: clamp(1.5rem, 3vw, 2.5rem) Playfair Display weight 400 #0F0E0D
5. Description below name: 0.875rem Inter weight 300 #6B6762
6. Replace any existing service content with the 8 services 
   listed exactly in UIFIX.md Fix 03
7. Section padding top and bottom: clamp(64px, 10vw, 192px)
8. Eyebrow: "02 — SERVICES"

Do not touch any other section. Screenshot and verify before Fix 04.
```

---

## Fix 04 — Work Grid

### Problems
- Project cards are too small
- Image placeholders are not tall enough (should be square or 4:3 ratio)
- Card titles are too small
- Grid gap is too tight
- Cards need more breathing room

### Exact fix

```
- Grid: 2 columns on desktop, 1 column on mobile
- Grid gap: 24px
- Image placeholder: aspect-ratio 4/3, background #F2F0ED, 
  full width of card
- "IMAGE" label inside placeholder: 0.75rem mono #6B6762 centered
- Project name: clamp(1.5rem, 2.5vw, 2rem) Playfair Display weight 400 #0F0E0D
  margin-top: 16px
- Metadata: 0.75rem mono uppercase #6B6762, margin-top: 4px
  format: "CATEGORY · YEAR"
- No card border, no shadow, no border-radius on images
- Section padding: clamp(64px, 10vw, 192px) top and bottom
```

### Project content
```
Lead Engine          —  Brokerage Automation  ·  2026
Tenant Portal Sync   —  Property Management   ·  2025
Listing Alert System —  Agent Automation      ·  2025
Contract Autopilot   —  Document Automation   ·  2024
```

### Cline prompt
```
Read UIFIX.md Fix 04. Fix only the Work grid section in HomePage.tsx.

1. 2-column grid desktop, 1-column mobile, 24px gap
2. Image placeholder: aspect-ratio 4/3, background #F2F0ED, 
   no border-radius, "IMAGE" label mono 0.75rem #6B6762 centered
3. Project name: clamp(1.5rem,2.5vw,2rem) Playfair Display weight 400 
   #0F0E0D, margin-top 16px
4. Metadata: 0.75rem mono uppercase #6B6762, margin-top 4px
5. No card border, no shadow, no border-radius
6. Replace project names and categories with content from UIFIX.md Fix 04
7. Section padding: clamp(64px, 10vw, 192px) top and bottom
8. Eyebrow: "03 — WORK"

Do not touch any other section. Screenshot and verify before Fix 05.
```

---

## Fix 05 — Process Section

### Problems
- Three columns are too compressed and text is illegible
- Step numbers are not visually distinct
- Too little padding between columns
- Section overall feels rushed

### Exact fix

```
- Section padding: clamp(64px, 10vw, 192px) top and bottom
- Three columns, equal width, gap: clamp(32px, 5vw, 80px)
- On mobile: stacked vertically with 48px gap between steps
- Step number: 0.75rem mono #6B6762 uppercase, margin-bottom 16px
- Step title: clamp(1.5rem, 2.5vw, 2rem) Playfair Display weight 400 #0F0E0D
  margin-bottom: 16px
- Hairline divider below step title: 1px #E0DDDA, full column width
- Step body: 0.875rem Inter weight 300 #6B6762 line-height 1.6
  margin-top: 16px
- Eyebrow: "04 — PROCESS"
```

### Step content
```
01                        02                        03
Discovery                 Build                     Monitor
─────────────────         ─────────────────         ─────────────────
We map your current       We connect your tools     Every automation runs
operations and identify   and build workflows       through your dashboard.
every manual task that    tailored to how you       You see what ran, when,
can be automated.         work. No templates.       and how many records
                          No cookie-cutter          were processed — in
                          solutions.                real time.
```

### Cline prompt
```
Read UIFIX.md Fix 05. Fix only the Process section in HomePage.tsx.

1. Three equal columns, gap clamp(32px, 5vw, 80px)
2. Mobile: stacked vertically, 48px gap between steps
3. Step number: 0.75rem mono #6B6762 uppercase, margin-bottom 16px
4. Step title: clamp(1.5rem,2.5vw,2rem) Playfair Display weight 400 
   #0F0E0D, margin-bottom 16px
5. Hairline divider 1px #E0DDDA below each step title
6. Step body: 0.875rem Inter weight 300 #6B6762 line-height 1.6
7. Replace step content with exact text from UIFIX.md Fix 05
8. Section padding: clamp(64px, 10vw, 192px) top and bottom
9. Eyebrow: "04 — PROCESS"

Do not touch any other section. Screenshot and verify before Fix 06.
```

---

## Fix 06 — Global Spacing and Padding

### Apply after all sections are fixed individually

### Problems
- Inconsistent left/right padding across sections
- Sections bleed into each other with no clear separation
- Content width is inconsistent — some sections full width, some compressed

### Exact fix

```css
/* Apply to all top-level section containers */
.section {
  padding-left: clamp(24px, 5vw, 80px);
  padding-right: clamp(24px, 5vw, 80px);
  padding-top: clamp(64px, 10vw, 192px);
  padding-bottom: clamp(64px, 10vw, 192px);
}

/* Max content width for text-heavy sections */
.section-content {
  max-width: 1280px;
  margin: 0 auto;
}
```

### Cline prompt
```
Read UIFIX.md Fix 06. Apply global spacing fixes to HomePage.tsx.

1. Every section must have consistent left/right padding:
   clamp(24px, 5vw, 80px) on both sides
2. Every section must have consistent top/bottom padding:
   clamp(64px, 10vw, 192px) on both sides
3. Maximum content width 1280px centered with margin auto
4. No section should have content bleeding to the edge of the viewport
5. Check every section — hero, what we do, services, work, 
   process, stats, footer — and apply consistent padding

Do not change any font sizes, colors, or content. 
Only fix padding and max-width. Screenshot full page and verify.
```

---

## Fix 07 — Nav

### Problems
- Nav links may be misaligned after other fixes
- Client Login link styling may be inconsistent with other links

### Exact fix

```
- Nav height: 64px
- Position: fixed top, full width, z-index 100
- Background: transparent initially, #FEFDFC on scroll with 
  1px bottom border #E0DDDA
- Left: "STUDIO" wordmark, 0.875rem uppercase mono #0F0E0D
- Right: nav links in a row, gap 32px
- All links: 0.75rem uppercase Inter weight 500 letter-spacing 0.08em #0F0E0D
- No underline, no hover color change — only opacity 0.6 on hover
- Active link: font-weight 600 or underline offset
- Client Login and Sign Out use inline styles to prevent class conflicts
```

### Cline prompt
```
Read UIFIX.md Fix 07. Fix only the Nav component in Nav.tsx.

1. Nav height 64px, fixed top, full width, z-index 100
2. Background transparent, switches to #FEFDFC with 1px bottom 
   border #E0DDDA when scrolled past 20px
3. Left: STUDIO wordmark 0.875rem uppercase mono #0F0E0D
4. Right: links with 32px gap
5. All links: 0.75rem uppercase Inter weight 500 
   letter-spacing 0.08em #0F0E0D no underline
6. Hover: opacity 0.6 transition 0.2s
7. Keep Client Login and Sign Out inline styles exactly as 
   they are — do not convert to Tailwind classes

Do not touch any page content. Screenshot nav scrolled and 
unscrolled and verify both states.
```

---

## Verification Checklist

Run through this after all 7 fixes are applied:

- [ ] Hero is full viewport height, headline bottom left, top 60% empty
- [ ] Hero headline is weight 400 not bold
- [ ] What We Do paragraph is large and readable, left aligned
- [ ] Services are full-width rows with proper numbers and descriptions
- [ ] Work grid has tall image placeholders, proper card spacing
- [ ] Process section has three readable columns with dividers
- [ ] All sections have consistent left/right padding
- [ ] No section content is compressed to center of viewport
- [ ] Nav is fixed, transparent on load, white on scroll
- [ ] Client Login shows when logged out, Sign Out shows when logged in
- [ ] No blue text anywhere on the page
- [ ] No bold headlines (all display text weight 400)
