import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Work", path: "/" },
  { label: "Services", path: "/#services" },
  { label: "Contact", path: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-inverse text-inverse-text">
      <div className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <span className="text-label font-mono uppercase tracking-[0.08em]">
            Studio
          </span>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-label font-sans uppercase tracking-[0.08em] text-inverse-text/70 hover:text-inverse-text transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Middle copy */}
        <p className="mt-16 max-w-md text-base font-sans text-inverse-text/60 font-light leading-relaxed">
          Automating real estate operations for private clients worldwide.
        </p>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col md:flex-row justify-between gap-4 text-label font-sans uppercase tracking-[0.08em] text-inverse-text/40">
          <span>&copy;2026</span>
          <span>IG / LI</span>
        </div>
      </div>
    </footer>
  );
}