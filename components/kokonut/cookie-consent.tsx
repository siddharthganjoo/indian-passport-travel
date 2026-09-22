'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = React.useState(true);
  const [marketingAllowed, setMarketingAllowed] = React.useState(false);

  React.useEffect(() => {
    const decided = localStorage.getItem('cookie_consent_decided');
    if (!decided) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent_decided', 'true');
    localStorage.setItem('cookie_consent_analytics', 'true');
    localStorage.setItem('cookie_consent_marketing', 'true');
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookie_consent_decided', 'true');
    localStorage.setItem('cookie_consent_analytics', 'false');
    localStorage.setItem('cookie_consent_marketing', 'false');
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent_decided', 'true');
    localStorage.setItem('cookie_consent_analytics', String(analyticsAllowed));
    localStorage.setItem('cookie_consent_marketing', String(marketingAllowed));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl text-zinc-900 dark:text-zinc-100"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold tracking-tight">Privacy & Cookie Choices</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                We prioritize user data privacy under the DPDP Act & GDPR. We retain zero passport credentials. Cookies are only used to preserve flight searches and interface preferences. Read our{' '}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-white">
                  Privacy Policy
                </Link>.
              </p>

              {/* Granular Preferences Accordion */}
              {showPreferences && (
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Essential Cookies</span>
                    <span className="text-[11px] font-mono text-zinc-400">Always Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="analytics-opt" className="text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      Anonymous Analytics
                    </label>
                    <input
                      id="analytics-opt"
                      type="checkbox"
                      checked={analyticsAllowed}
                      onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="marketing-opt" className="text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      Flight Partner Cookies
                    </label>
                    <input
                      id="marketing-opt"
                      type="checkbox"
                      checked={marketingAllowed}
                      onChange={(e) => setMarketingAllowed(e.target.checked)}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!showPreferences ? (
                  <>
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-xs font-medium transition-colors"
                    >
                      Accept All
                    </button>
                    <button
                      type="button"
                      onClick={handleAcceptNecessary}
                      className="py-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Essential Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreferences(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1"
                    >
                      <span>Customize</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium"
                    >
                      Save Preferences
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreferences(false)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 px-2"
                    >
                      <span>Back</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
