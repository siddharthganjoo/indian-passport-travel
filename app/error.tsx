'use client';

import Link from 'next/link';

/** Branded fallback for unexpected errors. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[50vh] flex flex-col items-start justify-center gap-4 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Something went wrong.</h1>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
        This one is on us. Try again — if it keeps happening, please let us know from the Help page.
      </p>
      <div className="flex gap-3 pt-2">
        <button onClick={reset} className="h-11 px-5 rounded-full bg-black text-white text-sm font-medium dark:bg-white dark:text-black">
          Try again
        </button>
        <Link href="/help" className="h-11 px-5 inline-flex items-center rounded-full border border-zinc-300 text-sm dark:border-zinc-700">
          Help
        </Link>
      </div>
    </div>
  );
}
