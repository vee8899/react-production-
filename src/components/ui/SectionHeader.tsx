type SectionHeaderProps = {
  label: string;
};

export default function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <div className="section-header mb-8">
      <span className="text-label font-mono uppercase tracking-[0.08em] text-muted block mb-3">
        {label}
      </span>
      <hr />
    </div>
  );
}