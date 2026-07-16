import { Link } from "react-router-dom";
import { contactHref } from "@/utils/contact";

export default function Footer() {
return (
<footer className="bg-inverse text-inverse-text">
<div className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
{/* Top row */}
<div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
{/* Logo */}
<span className="text-label font-mono uppercase tracking-[0.08em]">
Studio
</span>

{/* Navigation */}
<div className="grid w-full max-w-4xl grid-cols-2 gap-y-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
{/* Work / Privacy */}
<div className="flex flex-col gap-3">
<Link
to="/"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Work
</Link>

<Link
to="/legal/privacy"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Privacy
</Link>
</div>

{/* Services */}
<div>
<Link
to="/#services"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Services
</Link>
</div>

{/* Contact */}
<div>
<a
href={contactHref}
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Contact
</a>
</div>

{/* Terms */}
<div>
<Link
to="/legal/terms"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Terms
</Link>
</div>
</div>
</div>

{/* Middle copy */}
<p className="mt-16 max-w-md text-base font-sans font-light leading-relaxed text-inverse-text/60">
Automation infrastructure for the workflows that keep modern teams
moving.
</p>

{/* Bottom row */}
<div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-label font-sans uppercase tracking-[0.08em] text-inverse-text/40 md:flex-row md:items-center md:justify-between">
<span>&copy; 2026</span>

<span>IG / LI</span>
</div>
</div>
</footer>
);
}