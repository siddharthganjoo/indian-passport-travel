'use client';

import * as React from 'react';
import Link from 'next/link';

/** Slim consent bar. Stores the choice under the keys lib/analytics.ts reads. */
export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      setVisible(!localStorage.getItem('cookie_consent_decided'));
    } catch {
      // storage blocked — don't nag
    }
  }, []);

  const decide = (analytics: boolean) => {
    try {
      localStorage.setItem('cookie_consent_decided', 'true');
      localStorage.setItem('cookie_consent_analytics', String(analytics));
      localStorage.setItem('cookie_consent_marketing', 'false');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
        <p className="text-zinc-600 dark:text-zinc-400">
          We use essential storage to remember your searches, and optional anonymous analytics.{' '}
          <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => decide(false)}
            className="h-9 px-3 rounded-lg border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="h-9 px-3 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
