# ADR: Shared styling and motion

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

The interface uses a common typography, color, spacing, and motion vocabulary across public and authenticated screens.

## Current decision

- Import the main stylesheet through src/index.css into styles/globals.css, which contains Tailwind/theme and project styling.
- Use shared UI and motion components where a behavior or visual pattern repeats. TypeScript tokens and inline styles also exist; they are not automatically synchronized with CSS tokens.
- App sets MotionConfig to respect user reduced-motion preferences; some feature components additionally observe the browser preference.

## Rationale and alternatives

Tailwind utilities and project CSS support incremental page work without a runtime theme service. Mixed inline/CSS/token values require review to prevent divergence. A component-library migration or a second theme system would introduce a new source of visual rules; neither is adopted here. Keep keyboard focus and reduced-motion behavior part of verification.

## Verification and references

Inspect [global styles](../../src/styles/globals.css), [TypeScript tokens](../../src/styles/tokens.ts), [motion components](../../src/components/motion/), and [App](../../src/App.tsx).
