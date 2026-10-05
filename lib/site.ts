/** Site-wide settings. Set these in the environment before going live. */
export const SITE = {
  name: 'jugo',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://jugo.travel',
  /** Shown on Help/Privacy/Terms. Hidden if not set, so no placeholder address is ever published. */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '',
  /** Shown on legal pages. */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || 'jugo',
  lastLegalUpdate: '5 October 2026',
};
