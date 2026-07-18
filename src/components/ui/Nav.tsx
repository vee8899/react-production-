import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { contactHref } from "@/utils/contact";
import { OperationsMenu } from "@/components/dashboard/OperationsMenu";

const privateNavLinks = [
  { label: "Dashboard", to: "/dashboard" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change (safe, idempotent)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.hash, location.pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background shadow-[0_1px_0_0_var(--color-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-[clamp(24px,5vw,80px)] h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-sm font-medium tracking-widest font-mono uppercase">
              PRIMESTATE SYSTEMS
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {isAuthenticated && privateNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-label font-sans uppercase tracking-[0.08em] text-muted hover:text-primary transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {link.label}
                </Link>
            ))}
            {isAuthenticated && <OperationsMenu />}
            <a
              href={contactHref}
              className="text-label font-sans uppercase tracking-[0.08em] text-muted hover:text-primary transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Contact &rarr;
            </a>
            {!isAuthenticated && (
              <a
                href="/login"
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#0F0E0D',
                  textDecoration: 'none',
                }}
              >
                Client Login
              </a>
            )}
            {isAuthenticated && (
              <button
                onClick={signOut}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#0F0E0D',
                  padding: 0,
                }}
              >
                Sign Out
              </button>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-1.5 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-6 h-px bg-primary transition-transform duration-300 ${
                menuOpen ? "rotate-45 translate-y-[3.5px]" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-primary transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-primary transition-transform duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

        {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8 lg:hidden">
          {isAuthenticated && privateNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-h1 font-display text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
          ))}
          {isAuthenticated && <OperationsMenu mobile />}
          <a
            href={contactHref}
            className="text-h1 font-display text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Contact &rarr;
          </a>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-h1 font-display text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              onClick={() => setMenuOpen(false)}
            >
              Client Login
            </Link>
          )}
          {isAuthenticated && (
            <button
              onClick={() => {
                signOut();
                setMenuOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0F0E0D',
                padding: 0,
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </>
  );
}
