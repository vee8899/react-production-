# Feature spec: public landing experience

Status: required behavior documented against the current implementation on 2026-09-05. This describes the public route, not planned marketing additions or historical audit findings.

## Purpose and route

The public / route introduces the managed workflow offering, presents operational examples and capabilities, and lets visitors estimate labor capacity and contact the team. It does not require an authenticated tenant.

## User experience

- Display the studio identity, a clear main heading, workflow examples, modular capabilities, engagement model, ROI calculator, governance links, and a final contact action.
- Contact actions use the shared mailto destination and inquiry subject. They open the user's mail client; the website does not submit a contact form or confirm delivery.
- Governance links open /security. Anonymous navigation exposes Client Login; signed-in navigation exposes dashboard/operations access and sign-out.
- The ROI calculator updates estimates from its workload, handling time, module, company-size, currency, and labor-rate inputs. It must keep estimate assumptions visible and must not imply guaranteed savings or a self-service purchase.
- Preserve keyboard-operable inputs/navigation, responsive layout, and reduced-motion behavior.

## Boundaries and limitations

The public page does not fetch tenant run history or require consent to read marketing content. The application still requires its public environment configuration at startup and currently shows a loading gate while auth initialization resolves.

The current route includes a mailto contact action and ROI component, not an embedded contact form or every feature component present in the repository. Do not infer visible sections from unused component files.

## Acceptance criteria

- An anonymous visitor can reach the public content without a login redirect.
- The document title identifies Prime State Systems, and the page has a meaningful main heading.
- Contact links use the shared contact helper; security and login navigation reach their documented routes.
- Updating calculator inputs recomputes displayed estimates according to the domain calculation; bounds and currency defaults remain enforced.
- Public content contains no real tenant data or privileged credentials.
- Keyboard navigation and narrow-screen layout remain usable; reduced-motion preference is respected by animated content.
- Page-load or route-module errors are distinguishable from successful content rendering; a mailto click is not reported as an email-delivery success.

## Implementation and verification references

See [home page](../../src/pages/HomePage.tsx), [navigation](../../src/components/ui/Nav.tsx), [contact helper](../../src/utils/contact.ts), [calculator logic](../../src/lib/roiCalculator.ts), [home tests](../../src/test/HomePage.test.tsx), and [calculator tests](../../src/test/roiCalculator.test.ts). Use the [local development](../runbooks/local-development.md) and [staging acceptance](../runbooks/staging-acceptance.md) procedures for browser evidence.
