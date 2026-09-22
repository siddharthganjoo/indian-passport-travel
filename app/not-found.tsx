'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Compass, Search, Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white mb-6 shadow-sm"
      >
        <Compass className="w-8 h-8 animate-spin-slow" />
      </motion.div>

      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
        Error 404 • Destination Uncharted
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-3">
        Page Not Found
      </h1>

      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed max-w-sm">
        The travel corridor or immigration page you requested could not be located on the DesiVisa map. Search below to discover active destinations.
      </p>

      {/* Kokonut Quick Search Recovery Bar */}
      <form onSubmit={handleSearch} className="w-full mb-6">
        <div className="relative flex items-center w-full rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white">
          <div className="pl-4 pr-2 text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country or city (e.g., Thailand, Georgia)..."
            className="w-full h-11 py-2 text-xs sm:text-sm bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            className="mr-2 px-3 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-1"
          >
            <span>Find</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Return to Dashboard CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-900 dark:text-white text-xs font-medium transition-all shadow-xs"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Return to Home Dashboard</span>
      </Link>
    </div>
  );
}
