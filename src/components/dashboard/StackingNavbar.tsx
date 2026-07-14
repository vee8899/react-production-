import { motion } from "framer-motion";
import { useState } from "react";

const items = [
  { href: "#workflows", label: "Workflows" },
  { href: "#recent-activity", label: "Recent Activity" },
];

export const StackingNavbar = ({ className = "sticky top-20 z-30" }: { className?: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      aria-label="Dashboard sections"
      className={`${className} flex justify-end`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
    >
      <div className="flex items-center gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ x: -112 * index }}
            animate={{ x: expanded ? 0 : -112 * index }}
            transition={{
              duration: 0.45,
              ease: "circInOut",
              delay: expanded ? 0.06 * index : 0,
              type: "spring",
            }}
            style={{ zIndex: items.length - index }}
          >
            <a
              href={item.href}
              className="flex items-center whitespace-nowrap rounded-3xl border border-border bg-[#F2F0ED]/90 px-5 py-3 text-sm text-primary shadow-sm backdrop-blur-lg transition-colors duration-300 hover:bg-primary hover:text-inverse-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {item.label}
            </a>
          </motion.div>
        ))}
      </div>
    </nav>
  );
};
