import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const publicNavLinks = [
  { label: "Work", hash: "work" },
  { label: "Services", hash: "services" },
];

const privateNavLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Workflows", to: "/workflows" },
];

const contactHref =
  "mailto:Prime%20State%20Systems%20%3Cprimestatesystems%40gmail.com%3E";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  const handleNavClick = useCallback(
    (hash: string) => {
      if (location.pathname === "/") {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(`/#${hash}`);
      }
    },
    [location.pathname, navigate]
  );

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
              Studio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {publicNavLinks.map((link) => (
              <button
                key={link.hash}
                onClick={() => handleNavClick(link.hash)}
                className="text-label font-sans uppercase tracking-[0.08em] text-muted hover:text-primary transition-colors duration-200 bg-transparent border-0 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated &&
              privateNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-label font-sans uppercase tracking-[0.08em] text-muted hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </Link>
            ))}
            <a
              href={contactHref}
              className="text-label font-sans uppercase tracking-[0.08em] text-muted hover:text-primary transition-colors duration-200"
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
            className="md:hidden flex flex-col gap-1.5 py-2"
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
        <div className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8 md:hidden">
          {publicNavLinks.map((link) => (
            <button
              key={link.hash}
              onClick={() => {
                handleNavClick(link.hash);
                setMenuOpen(false);
              }}
              className="text-h1 font-display text-muted bg-transparent border-0 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          {isAuthenticated &&
            privateNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-h1 font-display text-muted"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
          ))}
          <a
            href={contactHref}
            className="text-h1 font-display text-muted"
          >
            Contact &rarr;
          </a>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-h1 font-display text-muted"
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
