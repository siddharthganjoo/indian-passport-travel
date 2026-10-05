import data from '@/data/destinations.json';
import { CountryVisaProfile } from '@/types/visa';

/**
 * Build-time snapshot of the country dataset. Server code should read through
 * lib/db so edits made in /admin are visible; this is for scripts and tests.
 */
export const DESTINATIONS = data as CountryVisaProfile[];
