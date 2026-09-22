'use client';

import * as React from 'react';
import { Check, FileText, CheckCircle2 } from 'lucide-react';

interface DocumentChecklistProps {
  documents: string[];
  countryName: string;
}

export function DocumentChecklist({ documents, countryName }: DocumentChecklistProps) {
  const [checkedItems, setCheckedItems] = React.useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (documents.length || 1)) * 100);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <FileText className="w-3.5 h-3.5" />
            Mandatory Entry Checklist
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mt-1">
            Required Documents for {countryName}
          </h3>
        </div>

        {/* Progress pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {completedCount} of {documents.length} ready ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-zinc-900 dark:bg-white transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {documents.map((doc, idx) => {
          const isChecked = !!checkedItems[idx];
          return (
            <div
              key={idx}
              onClick={() => toggleItem(idx)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                isChecked
                  ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isChecked
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'border border-zinc-300 dark:border-zinc-700'
                }`}
              >
                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}`}>
                {doc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
