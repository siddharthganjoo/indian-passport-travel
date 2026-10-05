import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TripSearchValues } from '@/types/plan';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "2026-11-20" + 3 -> "2026-11-23" */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** ₹1.2L / ₹45k style, for tight spaces like chart labels. */
export function formatInrCompact(amount: number): string {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(amount >= 1_000_000 ? 0 : 1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${amount}`;
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
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

/** Local wall-clock time from an ISO string with offset: "2026-11-05T06:15:00+05:30" -> "06:15". */
export function formatClock(iso: string): string {
  return iso.slice(11, 16);
}

/** "2026-11-20" or ISO datetime -> "Fri, 20 Nov". Uses the local date in the string, not the viewer's zone. */
export function formatDay(isoOrDate: string): string {
  const d = new Date(`${isoOrDate.slice(0, 10)}T12:00:00Z`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** Calendar-day difference between two local dates, e.g. "+1". Empty when same day. */
export function dayShift(fromIso: string, toIso: string): string {
  const diff = Math.round((Date.parse(toIso.slice(0, 10)) - Date.parse(fromIso.slice(0, 10))) / 86_400_000);
  return diff > 0 ? `+${diff}` : '';
}

export function getVisaCategoryLabel(category: string): string {
  switch (category) {
    case 'visa_free':
      return 'Visa-free';
    case 'voa':
      return 'Visa on arrival';
    case 'evisa':
      return 'eVisa';
    case 'sticker_required':
      return 'Embassy visa';
    case 'airside_ok':
      return 'No visa (airside)';
    case 'transit_visa':
      return 'Transit visa';
    default:
      return category;
  }
}

/** Map/chart fill per visa category — the validated visa-ease ramp (see globals.css). */
export const EASE_FILL: Record<string, string> = {
  visa_free: 'var(--ease-free)',
  airside_ok: 'var(--ease-free)',
  voa: 'var(--ease-voa)',
  evisa: 'var(--ease-evisa)',
  sticker_required: 'var(--ease-embassy)',
  transit_visa: 'var(--ease-embassy)',
};

/** Dot class per visa category (same ramp as the map) — always paired with a text label. */
export function visaCategoryDot(category: string): string {
  switch (category) {
    case 'visa_free':
    case 'airside_ok':
      return 'bg-[var(--ease-free)]';
    case 'voa':
      return 'bg-[var(--ease-voa)]';
    case 'evisa':
      return 'bg-[var(--ease-evisa)]';
    default:
      return 'bg-[var(--ease-embassy)] ring-1 ring-inset ring-zinc-400 dark:ring-zinc-500';
  }
}

/** ISO-2 country code -> flag emoji (falls back to a white flag). */
export function flagEmoji(code: string): string {
  if (!/^[A-Z]{2}$/.test(code) || code === 'XK') return '🏳️';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Shareable results URL for a search. */
export function buildPlanUrl(v: TripSearchValues): string {
  const params = new URLSearchParams({ from: v.from, to: v.to, date: v.date, bags: v.bags });
  if (v.visas.length) params.set('visas', v.visas.join(','));
  return `/plan?${params}`;
}
