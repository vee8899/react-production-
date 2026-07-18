import { Link } from "react-router-dom";
import { contactHref } from "@/utils/contact";

export default function Footer() {
return (
<footer className="bg-inverse text-inverse-text">
<div className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
{/* Top row */}
<div className="flex flex-col gap-8 md:grid md:grid-cols-[160px_1fr] md:gap-0">
{/* Logo */}
<span className="text-label font-mono uppercase tracking-[0.08em]">
PRIMESTATE SYSTEMS
</span>

{/* Navigation */}
<nav
aria-label="Footer navigation"
className="grid w-full grid-cols-2 items-start gap-x-8 gap-y-4 sm:flex sm:w-fit sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-4 md:items-end md:justify-self-end"
>
<Link
to="/security"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Security
</Link>

<a
href={contactHref}
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Contact
</a>

<Link
to="/legal/terms"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Terms
</Link>
<Link
to="/legal/privacy"
className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 transition-colors duration-200 hover:text-inverse-text"
>
Privacy
</Link>
</nav>
</div>


{/* Middle copy */}
<p className="mt-16 max-w-md text-base font-sans font-light leading-relaxed text-inverse-text/60">
Modular enterprise automation for the workflows that keep modern teams
moving with operational visibility built in.
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
