# UI.md

This repo uses a restrained studio aesthetic with warm off-white backgrounds, near-black type, and sparse navigation.

## Current design system

- Colors live in `src/styles/globals.css` and the Tailwind theme tokens.
- Typography uses serif display, sans body, and mono metadata.
- Layout favors full-width sections with large vertical spacing and hairline dividers.
- Motion is subtle and purposeful; respect reduced-motion preferences.

## Live page structure

### Home

- Hero occupies the full viewport.
- Sections follow the landing-page order in `src/pages/HomePage.tsx`.
- The page currently includes:
  - What We Do
  - Services
  - Process
  - By The Numbers
  - Integrations Orbit
  - ROI Calculator
  - FAQ

### Dashboard

- Stats row
- Recent activity feed
- Quick actions

### Workflows

- Workflow list with status, latest run, and inline row detail patterns

## Component rules

- Keep section spacing consistent with the existing Tailwind utility pattern.
- Use the established `SectionHeader`, `FadeUp`, `PageTransition`, `StatsRow`, `RunsFeed`, and `WorkflowRow` components where they already exist.
- Avoid adding visual styles that fight the existing tokens.
- Verify in the browser after changing layout or motion.
