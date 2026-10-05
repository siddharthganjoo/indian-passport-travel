import type { BaseVisaCategory } from '@/types/visa';

/**
 * Generic, category-level guidance used when a country has no hand-written
 * document list or application steps yet.
 */
const COMMON_DOCS = [
  'Indian passport valid for at least 6 months beyond your travel dates, with 2 blank pages',
  'Confirmed return or onward ticket',
  'Hotel bookings or invitation letter for your whole stay',
];

export const GENERIC_DOCUMENTS: Record<BaseVisaCategory, string[]> = {
  visa_free: [
    ...COMMON_DOCS,
    'Proof of funds (recent bank statement or international card)',
  ],
  voa: [
    ...COMMON_DOCS,
    'Visa fee in US dollars (cash) — card payment is not always available',
    '2 passport-size photos (white background)',
    'Proof of funds (recent bank statement or international card)',
  ],
  evisa: [
    ...COMMON_DOCS,
    'Scanned passport bio page (colour, clear)',
    'Digital passport photo (white background, 35x45mm)',
    'Printed eVisa approval to show at check-in and immigration',
  ],
  sticker_required: [
    ...COMMON_DOCS,
    'Completed visa application form',
    '2 recent passport photos to the embassy\'s size specification',
    'Bank statements for the last 6 months (stamped)',
    'Income tax returns (ITR) for the last 2–3 years',
    'Employment letter / leave approval, or business registration if self-employed',
    'Travel insurance covering the full trip',
    'Cover letter describing the purpose and itinerary of your trip',
  ],
};

export const GENERIC_STEPS: Record<BaseVisaCategory, string[]> = {
  visa_free: [
    'No visa needed — just carry the documents listed below.',
    'Fill any online arrival card the country requires (check the official site 72 hours before flying).',
    'Show your return ticket and hotel booking if asked at immigration.',
  ],
  voa: [
    'No pre-approval needed — the visa is issued at the airport on arrival.',
    'Carry the fee in US dollars cash plus photos.',
    'Queue at the "Visa on Arrival" counter before immigration and pay the fee.',
    'Proceed to immigration with your passport, return ticket and hotel booking.',
  ],
  evisa: [
    'Apply on the official eVisa portal (avoid look-alike agent sites that charge extra).',
    'Upload your passport scan and photo, and pay the fee by card.',
    'Wait for approval by email — usually within the processing time shown.',
    'Print the eVisa and carry it with your passport.',
  ],
  sticker_required: [
    'Check which embassy or visa centre (e.g. VFS / BLS) covers your state.',
    'Book an appointment online — slots can fill weeks ahead in peak season.',
    'Prepare the document set below; get bank statements stamped.',
    'Attend the appointment for biometrics and submit your passport.',
    'Track the application online and collect your passport once decided.',
  ],
};
