/** Consistent page title block: small eyebrow, display headline, lead paragraph. */
export function PageHeader({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: React.ReactNode }) {
  return (
    <header className="max-w-3xl space-y-4">
      {eyebrow && <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{eyebrow}</p>}
      <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.02]">{title}</h1>
      {lead && <div className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">{lead}</div>}
    </header>
  );
}

/** Readable long-form text column. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-10 text-zinc-700 dark:text-zinc-300 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-zinc-900 dark:[&_h2]:text-white [&_h2]:mb-3 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-zinc-900 dark:[&_strong]:text-white">
      {children}
    </div>
  );
}
