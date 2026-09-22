'use client';

import * as React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Editorial Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center transition-transform group-hover:scale-105">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white uppercase font-mono">
              DesiVisa
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wider">
              Indian Passport Metasearch
            </span>
          </div>
        </Link>

        {/* Passport Status Indicator & Nav */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            <span>Holder: Republic of India (IND)</span>
          </div>

          <Link
            href="/privacy"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white px-2 py-1 transition-colors"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white px-2 py-1 transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </header>
  );
}
