import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'success' | 'info' | 'warning' | 'upgrade';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
        {
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700':
            variant === 'default',
          'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300':
            variant === 'outline',
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20':
            variant === 'success',
          'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20':
            variant === 'info',
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20':
            variant === 'warning',
          'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25 ring-1 ring-purple-500/20':
            variant === 'upgrade',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
