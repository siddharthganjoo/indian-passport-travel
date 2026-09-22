import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getVisaCategoryLabel(category: string): string {
  switch (category) {
    case 'visa_free':
      return 'Visa-Free';
    case 'voa':
      return 'Visa on Arrival';
    case 'evisa':
      return 'eVisa';
    case 'sticker_required':
      return 'Sticker Required';
    default:
      return category;
  }
}

export function getVisaCategoryBadgeColor(category: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (category) {
    case 'visa_free':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/20 dark:border-emerald-500/30',
        dot: 'bg-emerald-500',
      };
    case 'voa':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-500/15',
        text: 'text-sky-700 dark:text-sky-400',
        border: 'border-sky-500/20 dark:border-sky-500/30',
        dot: 'bg-sky-500',
      };
    case 'evisa':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/20 dark:border-amber-500/30',
        dot: 'bg-amber-500',
      };
    case 'sticker_required':
    default:
      return {
        bg: 'bg-zinc-500/10 dark:bg-zinc-500/15',
        text: 'text-zinc-700 dark:text-zinc-400',
        border: 'border-zinc-500/20 dark:border-zinc-500/30',
        dot: 'bg-zinc-500',
      };
  }
}
