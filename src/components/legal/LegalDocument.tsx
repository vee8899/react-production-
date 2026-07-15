import type { LegalDocument as LegalDocumentType } from "@/lib/legalConsent";

type LegalDocumentProps = {
  document: LegalDocumentType;
};

export default function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <article>
      <div className="flex items-baseline gap-4 mb-6">
        <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">
          v{document.version}
        </span>
        <span className="text-label font-mono uppercase tracking-[0.08em] text-muted">
          Effective {new Date(document.effective_at).toLocaleDateString()}
        </span>
      </div>
      <div
        className="prose prose-sm max-w-none font-sans text-primary font-[300] leading-[1.7]"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(document.content_md) }}
      />
    </article>
  );
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-primary mt-8 mb-3 text-[clamp(1.25rem,2vw,1.5rem)]">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-primary mt-10 mb-4 text-[clamp(1.5rem,3vw,2rem)]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-primary mt-0 mb-4 text-[clamp(2rem,4vw,3rem)]">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="font-mono text-sm bg-surface px-1.5 py-0.5">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-4 space-y-1">${match}</ul>`)
    .replace(/\n\n/g, '</p><p class="mt-4">')
    .replace(/^(.+)$/gm, (line) => {
      if (line.startsWith('<')) return line;
      return `<p>${line}</p>`;
    });
}
