export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export const respectReducedMotion = {
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    animation: "none",
  },
};

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const fadeUpTransition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1],
};