type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean>;
};

/**
 * Privacy-focused client analytics tracker without cookie bloat.
 * Operates without storing personal data or tracking cross-site cookies.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;

  // Check user cookie preference
  const consent = localStorage.getItem('cookie_consent_analytics');
  if (consent === 'false') {
    return;
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics Event]', event.name, event.properties);
  }

  // Hook for Cloudflare Web Analytics / PostHog / Vercel Analytics if configured
  if (typeof (window as unknown as { posthog?: { capture: (n: string, p?: unknown) => void } }).posthog?.capture === 'function') {
    (window as unknown as { posthog: { capture: (n: string, p?: unknown) => void } }).posthog.capture(event.name, event.properties);
  }
}
