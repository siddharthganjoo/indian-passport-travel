'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';

interface VisaTogglePillsProps {
  hasUSVisa: boolean;
  hasSchengen: boolean;
  hasUKVisa: boolean;
  onToggleUS: () => void;
  onToggleSchengen: () => void;
  onToggleUK: () => void;
  upgradedCount?: number;
}

export function VisaTogglePills({
  hasUSVisa,
  hasSchengen,
  hasUKVisa,
  onToggleUS,
  onToggleSchengen,
  onToggleUK,
  upgradedCount = 0,
}: VisaTogglePillsProps) {
  const springTransition = {
    type: 'spring' as const,
    stiffness: 350,
    damping: 25,
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-y border-zinc-200/80 dark:border-zinc-800/80 my-6">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
          Secondary Visas:
        </span>
        {upgradedCount > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springTransition}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            {upgradedCount} Relaxations Active
          </motion.span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* US Visa Toggle */}
        <motion.button
          type="button"
          onClick={onToggleUS}
          whileTap={{ scale: 0.96 }}
          className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            hasUSVisa
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
              hasUSVisa
                ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900'
                : 'border border-zinc-300 dark:border-zinc-700'
            }`}
          >
            {hasUSVisa && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springTransition}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </motion.div>
            )}
          </div>
          <span>I have a US Visa</span>
        </motion.button>

        {/* Schengen Visa Toggle */}
        <motion.button
          type="button"
          onClick={onToggleSchengen}
          whileTap={{ scale: 0.96 }}
          className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            hasSchengen
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
              hasSchengen
                ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900'
                : 'border border-zinc-300 dark:border-zinc-700'
            }`}
          >
            {hasSchengen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springTransition}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </motion.div>
            )}
          </div>
          <span>I have a Schengen Visa</span>
        </motion.button>

        {/* UK Visa Toggle */}
        <motion.button
          type="button"
          onClick={onToggleUK}
          whileTap={{ scale: 0.96 }}
          className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            hasUKVisa
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
              hasUKVisa
                ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900'
                : 'border border-zinc-300 dark:border-zinc-700'
            }`}
          >
            {hasUKVisa && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springTransition}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </motion.div>
            )}
          </div>
          <span>I have a UK Visa</span>
        </motion.button>
      </div>
    </div>
  );
}
