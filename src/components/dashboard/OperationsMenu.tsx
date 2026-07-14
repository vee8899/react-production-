import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const operations = [
  { label: "Workflows", to: "/workflows" },
  { label: "Recent Activity", to: "/activity" },
];

export const OperationsMenu = ({ mobile = false }: { mobile?: boolean }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const active = operations.some((item) => item.to === location.pathname);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (mobile) {
    return (
      <div ref={menuRef} className="flex flex-col items-center gap-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-operations-menu"
          onClick={() => setOpen((value) => !value)}
          className={`text-h1 font-display bg-transparent border-0 cursor-pointer transition-colors duration-200 ${active ? "text-primary" : "text-muted"}`}
        >
          Operations {open ? "−" : "+"}
        </button>
        {open && (
          <div id="mobile-operations-menu" className="flex flex-col items-center gap-4" role="menu">
            {operations.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`text-lg font-display transition-colors duration-200 ${location.pathname === item.to ? "text-primary" : "text-muted hover:text-primary"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="desktop-operations-menu"
        onClick={() => setOpen((value) => !value)}
        className={`text-label font-sans uppercase tracking-[0.08em] transition-colors duration-200 ${active ? "text-primary" : "text-muted hover:text-primary"}`}
      >
        Operations {open ? "−" : "+"}
      </button>
      {open && (
        <div
          id="desktop-operations-menu"
          role="menu"
          className="absolute right-0 top-full mt-4 min-w-44 border border-border bg-background p-2 shadow-[0_8px_24px_rgba(15,14,13,0.08)]"
        >
          {operations.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-3 py-3 text-label font-sans uppercase tracking-[0.08em] transition-colors duration-200 ${location.pathname === item.to ? "text-primary bg-surface" : "text-muted hover:text-primary hover:bg-surface"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
