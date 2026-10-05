'use client';

import * as React from 'react';
import { cn, flagEmoji, getVisaCategoryLabel, visaCategoryDot } from '@/lib/utils';

export interface CountryOption {
  code: string;
  name: string;
  category: string;
}

interface Props {
  id: string;
  countries: CountryOption[];
  value: string;
  onChange: (code: string) => void;
  invalid?: boolean;
}

export function CountryCombobox({ id, countries, value, onChange, invalid }: Props) {
  const selected = countries.find((c) => c.code === value);
  const [query, setQuery] = React.useState(selected?.name ?? '');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    setQuery(selected?.name ?? '');
  }, [selected?.name]);

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === selected?.name.toLowerCase()) return countries.slice(0, 8);
    return countries
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q)
      .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)))
      .slice(0, 8);
  }, [countries, query, selected?.name]);

  const choose = (c: CountryOption) => {
    onChange(c.code);
    setQuery(c.name);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && matches[active]) {
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-none" aria-hidden>
          {selected ? flagEmoji(selected.code) : '🌍'}
        </span>
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          autoComplete="off"
          placeholder="Country"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
            if (selected) setQuery(selected.name);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full h-12 pl-10 pr-3 rounded-lg border-2 bg-zinc-100 text-base font-medium focus:bg-white focus:border-black focus:outline-none dark:bg-zinc-800 dark:focus:bg-zinc-900 dark:focus:border-white',
            invalid ? 'border-rose-500' : 'border-transparent'
          )}
        />
      </div>
      {open && matches.length > 0 && (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-80 overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {matches.map((c, i) => (
            <li
              key={c.code}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(c);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 cursor-pointer text-sm',
                i === active && 'bg-zinc-100 dark:bg-zinc-800'
              )}
            >
              <span className="text-lg leading-none" aria-hidden>{flagEmoji(c.code)}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className={cn('w-1.5 h-1.5 rounded-full', visaCategoryDot(c.category))} aria-hidden />
                {getVisaCategoryLabel(c.category)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
