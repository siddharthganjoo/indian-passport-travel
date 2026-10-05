import { cn } from '@/lib/utils';

/**
 * jugo wordmark — geometric, heavy round strokes; the tittle of the "j" is the
 * brand-green dot (a destination pin). Strokes use currentColor, so it works
 * on black and white. Height follows font-size (1em ≈ cap-to-descender).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-3 0 92 42"
      className={cn('h-[1em] w-auto', className)}
      role="img"
      aria-label="jugo"
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* j */}
      <path d="M8 15v15.5a6.5 6.5 0 0 1-6.5 6.5" />
      <circle cx="8" cy="4.8" r="4.3" fill="var(--color-brand)" stroke="none" />
      {/* u */}
      <path d="M21 15v7a7 7 0 0 0 14 0v-7M35 15v14" />
      {/* g */}
      <circle cx="52" cy="22" r="7" />
      <path d="M59 15v15.5a6.5 6.5 0 0 1-6.5 6.5h-3" />
      {/* o */}
      <circle cx="76" cy="22" r="7" />
    </svg>
  );
}
