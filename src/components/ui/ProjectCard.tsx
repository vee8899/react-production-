import { motion } from "framer-motion";

type ProjectCardProps = {
  name: string;
  category: string;
  year: string;
  index: number;
};

export default function ProjectCard({ name, category, year, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      {/* Placeholder image */}
      <div className="aspect-[4/3] bg-surface mb-4 overflow-hidden">
        <div className="w-full h-full bg-surface flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-[0.4s] ease-out">
          <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">
            Image
          </span>
        </div>
      </div>
      <h3 className="text-h2 font-display text-primary">{name}</h3>
      <span className="text-label font-mono uppercase tracking-[0.05em] text-muted">
        {category} &middot; {year}
      </span>
    </motion.div>
  );
}