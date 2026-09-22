import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          {
            'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm':
              variant === 'primary',
            'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700':
              variant === 'secondary',
            'border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900':
              variant === 'outline',
            'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850':
              variant === 'ghost',
            'text-zinc-900 dark:text-zinc-100 underline-offset-4 hover:underline p-0':
              variant === 'link',
          },
          {
            'text-xs px-2.5 py-1.5 h-8 gap-1.5': size === 'sm',
            'text-sm px-4 py-2 h-10 gap-2': size === 'md',
            'text-base px-6 py-3 h-12 gap-2.5': size === 'lg',
            'h-9 w-9 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
