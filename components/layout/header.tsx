'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Fly' },
  { href: '/visas', label: 'Visas' },
  { href: '/transit-hubs', label: 'Transit hubs' },
  { href: '/routes', label: 'Route ideas' },
];
const MOBILE_EXTRA = [
  { href: '/help', label: 'Help' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/plan') : pathname.startsWith(href) || (href === '/visas' && pathname.startsWith('/destination'));

  return (
    <header className="on-dark sticky top-0 z-40 bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="text-[30px] -mb-1.5" aria-label="jugo home">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1 mr-auto" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'px-3.5 h-9 inline-flex items-center rounded-full text-sm font-medium transition-colors',
                isActive(item.href) ? 'bg-white text-black' : 'text-white hover:bg-white/15'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/help" className="hidden md:inline-flex items-center h-9 px-3.5 rounded-full text-sm font-medium hover:bg-white/15">
          Help
        </Link>

        <button
          type="button"
          className="md:hidden -mr-2 p-2 rounded-full hover:bg-white/15"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/10 px-4 pb-6 pt-2" aria-label="Main">
          {[...NAV, ...MOBILE_EXTRA].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block py-4 font-display text-2xl font-bold tracking-tight border-b border-white/10',
                isActive(item.href) ? 'text-white' : 'text-zinc-400'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
