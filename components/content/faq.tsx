import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

/** Accessible accordion (native <details>) plus FAQPage structured data for search engines. */
export function Faq({ items, heading = 'Frequently asked questions', id = 'faq' }: { items: FaqItem[]; heading?: string; id?: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id} className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
        {heading}
      </h2>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-medium">
              {item.q}
              <ChevronDown className="w-4 h-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pb-5 -mt-1 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">{item.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </section>
  );
}
