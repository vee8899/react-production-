import { Link } from "react-router-dom";
import { contactHref } from "@/utils/contact";

export default function Footer() {
return (
<footer className="bg-inverse text-inverse-text">
<div className="mx-auto max-w-7xl px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
{/* Top Section */}
<div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
{/* Logo */}
<span className="text-label font-mono uppercase tracking-[0.08em]">
Studio
</span>

{/* Navigation */}
<div className="grid grid-cols-2 gap-x-12 gap-y-10 md:grid-cols-4 md:gap-x-24">
{/* Column 1 */}
<div className="flex flex-col gap-4">
<Link
to="/"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition hover:text-inverse-text"
>
Work
</Link>

<Link
to="/legal/privacy"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition hover:text-inverse-text"
>
Privacy
</Link>
</div>

{/* Column 2 */}
<div className="flex flex-col gap-4">
<Link
to="/#services"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition hover:text-inverse-text"
>
Services
</Link>
</div>

{/* Column 3 */}
<div className="flex flex-col gap-4">
<a
href={contactHref}
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition hover:text-inverse-text"
>
Contact
</a>
</div>

{/* Column 4 */}
<div className="flex flex-col gap-4">
<Link
to="/legal/terms"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition hover:text-inverse-text"
>
Terms
</Link>
</div>
</div>
</div>

{/* Middle Copy */}
<p className="mt-16 max-w-md text-base font-light leading-relaxed text-inverse-text/60">
Automation infrastructure for the workflows that keep modern
teams moving.
</p>

{/* Bottom Row */}
<div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-label font-sans uppercase tracking-[0.08em] text-inverse-text/60 md:flex-row md:items-center md:justify-between">
<span>© 2026</span>

<span>IG / LI</span>
</div>
</div>
</footer>
);
}