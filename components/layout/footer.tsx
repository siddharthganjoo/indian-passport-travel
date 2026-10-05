import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

const COLUMNS = [
  {
    title: 'Plan',
    links: [
      { href: '/', label: 'Search flights' },
      { href: '/routes', label: 'Route ideas' },
      { href: '/transit-hubs', label: 'Transit hubs' },
    ],
  },
  {
    title: 'Visas',
    links: [
      { href: '/visas', label: 'All countries' },
      { href: '/visas?category=visa_free', label: 'Visa-free' },
      { href: '/visas?category=evisa', label: 'eVisa' },
    ],
  },
  {
    title: 'jugo',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="on-dark bg-black text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="text-[34px] inline-block" aria-label="jugo home">
              <Logo />
            </Link>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Cheaper ways to fly abroad on an Indian passport — with every visa on the route sorted.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="space-y-3">
              <h2 className="text-sm font-medium">{col.title}</h2>
              <ul className="space-y-2 text-sm text-zinc-400">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col gap-2 sm:flex-row sm:justify-between text-xs text-zinc-500">
          <p>jugo is not a visa agency or airline. Rules change — always confirm on official government websites.</p>
          <p>© {new Date().getFullYear()} jugo</p>
        </div>
      </div>
    </footer>
  );
}
