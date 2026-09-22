'use client';

import * as React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface FloatingSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  totalResults?: number;
  selectedContinent: string;
  onSelectContinent: (continent: string) => void;
  continents: string[];
}

export function FloatingSearch({
  value,
  onChange,
  placeholder = 'Search destinations, cities, or continents (e.g., Bali, Thailand, Europe)...',
  totalResults,
  selectedContinent,
  onSelectContinent,
  continents,
}: FloatingSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Floating search container */}
      <div className="relative flex items-center w-full rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-white focus-within:border-transparent">
        <div className="pl-4 pr-2 text-zinc-400 dark:text-zinc-500">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-13 py-3 pr-24 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
        />

        <div className="absolute right-3 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-mono font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Region quick filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <div className="flex items-center gap-1 text-zinc-400 text-xs px-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
        {continents.map((continent) => {
          const isSelected = selectedContinent === continent;
          return (
            <button
              key={continent}
              type="button"
              onClick={() => onSelectContinent(isSelected && continent !== 'All' ? 'All' : continent)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {continent}
            </button>
          );
        })}

        {totalResults !== undefined && (
          <span className="ml-auto pl-2 text-xs font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
            {totalResults} {totalResults === 1 ? 'country' : 'countries'}
          </span>
        )}
      </div>
    </div>
  );
}
