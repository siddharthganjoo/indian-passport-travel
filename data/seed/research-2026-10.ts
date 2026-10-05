import type { ConditionalPassRules, CountryVisaProfile, ResearchRecord } from '@/types/visa';
import type { TransitHubProfile } from '@/types/routes';

/**
 * Desk research pass, 5 October 2026.
 *
 * Method: every country's entry type was cross-checked against IATA Timatic
 * data (as cited on Wikipedia's "Visa requirements for Indian citizens").
 * Disagreements and the most-travelled destinations were then researched
 * individually — official government/embassy pages first, then recent news
 * and traveller reports. This is NOT a human verification: records keep
 * lastVerifiedAt = null until an editor checks them in /admin.
 */
export const RESEARCH_DATE = '2026-10-05';

const WIKI = { label: 'IATA Timatic data via Wikipedia — Visa requirements for Indian citizens', url: 'https://en.wikipedia.org/wiki/Visa_requirements_for_Indian_citizens' };
const SCHENGEN_FEE = { label: 'Schengen visa fee €90 + VFS charges (HelloSafe, 2026)', url: 'https://hellosafe.com/schengen-visa/from-india' };
const EU_POLICY = { label: 'European Commission — Schengen visa policy', url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en' };

export interface CountryResearch {
  patch: Partial<CountryVisaProfile>;
  confidence: ResearchRecord['confidence'];
  summary: string;
  sources: ResearchRecord['sources'];
}

const waiver = (
  category: 'visa_free' | 'voa' | 'evisa',
  days: number,
  notes: string,
  feeUsd?: number
): NonNullable<ConditionalPassRules['validUSVisaHolder']> => ({
  eligibleCategory: category,
  allowedStayDays: days,
  ...(feeUsd !== undefined ? { specialFeeUsd: feeUsd } : {}),
  conditionNotes: notes,
});

const SCHENGEN_PATCH: CountryResearch = {
  patch: { baseFeeUsd: 105, baseFeeInr: 8300, processingTimeDays: { min: 15, max: 45 } },
  confidence: 'high',
  summary: 'Schengen short-stay visa fee is €90 (since June 2024) plus a VFS/BLS service charge of about ₹1,900–3,100. Processing 10–15 working days, longer in peak season.',
  sources: [SCHENGEN_FEE, EU_POLICY, WIKI],
};

export const COUNTRY_RESEARCH: Record<string, CountryResearch> = {
  // ── Major destinations, researched individually ──────────────────────────
  TH: {
    patch: {
      stayDurationDays: 30,
      requiredDocuments: [
        'Passport valid for 6+ months from arrival',
        'Confirmed return or onward ticket',
        'Hotel bookings for your stay',
        'Thailand Digital Arrival Card (TDAC), submitted online within 72 hours before arrival',
        'Proof of funds',
      ],
    },
    confidence: 'high',
    summary: 'Visa exemption for Indians cut from 60 to 30 days, effective 15 Sept 2026 (Royal Gazette, 31 Aug 2026). TDAC arrival card is mandatory.',
    sources: [
      { label: 'Royal Thai Embassy, New Delhi — revision to visa exemption for Indian passport holders', url: 'https://newdelhi.thaiembassy.org/en/content/latest-update-on-revision-to-thailand-s-visa-exemp' },
      { label: 'Khaleej Times — 30-day visa-free entry from 15 Sept', url: 'https://www.khaleejtimes.com/asia/thailand-indian-tourists-visa-free-entry-30-days-sept-15' },
    ],
  },
  MY: {
    patch: {
      requiredDocuments: [
        'Passport valid for 6+ months',
        'Confirmed return ticket',
        'Confirmed hotel booking',
        'Proof of sufficient funds (bank statement or cards)',
        'Malaysia Digital Arrival Card (MDAC), submitted online within 3 days before arrival',
      ],
      tagline: 'Visa-free for Indians for 30 days until 31 December 2026. Immigration at KLIA refuses entry when return tickets, hotel bookings or funds can’t be shown.',
    },
    confidence: 'high',
    summary: '30-day visa exemption extended to 31 Dec 2026 — recheck in December. Indian High Commission and news reports document travellers refused entry for missing return tickets, hotel proof or funds.',
    sources: [
      { label: 'Malaysia extends visa exemption for Indians to 31 Dec 2026', url: 'https://humanresourcesonline.net/malaysia-extends-visa-exemption-for-india-citizens-to-31-december-2026' },
      { label: 'High Commission of India, Kuala Lumpur — advisory on stranded Indian nationals', url: 'https://hcikl.gov.in/pdf/indian-nationals-getting-stranded-in-malaysia.pdf' },
      { label: 'Gulf News — why Indians are denied entry under the visa-free scheme', url: 'https://gulfnews.com/business/tourism/why-are-indians-denied-entry-into-malaysia-under-30-day-visa-free-entry-scheme-1.500249807' },
    ],
  },
  BR: {
    patch: {
      defaultCategory: 'sticker_required',
      baseFeeUsd: 95,
      baseFeeInr: 8000,
      processingTimeDays: { min: 10, max: 21 },
      stayDurationDays: 90,
      applicationSteps: [
        'Fill in the online visa application form (RER) on the Brazilian e-consular system.',
        'Book a submission with the Embassy of Brazil in New Delhi or the Consulate in Mumbai.',
        'Submit your passport, documents and fee; processing is about 10–15 working days.',
        'A 10-year multiple-entry visitor visa (stays up to 90 days) is available since February 2026.',
      ],
      requiredDocuments: [
        'Passport valid for 6+ months with blank pages',
        'Completed RER application form',
        'Recent passport photo',
        'Return ticket and hotel bookings',
        'Bank statements for the last 6 months and ITRs',
        'Yellow fever vaccination certificate (required to re-enter India)',
      ],
    },
    confidence: 'high',
    summary: 'Corrected from eVisa to embassy visa: Brazil’s eVisa is not open to Indians. Visitor visa (VIVIS) via Embassy New Delhi / Consulate Mumbai, about ₹8,000, 10–15 working days; 10-year option since Feb 2026.',
    sources: [
      { label: 'Embassy of Brazil in New Delhi — consular section', url: 'https://www.gov.br/mre/pt-br/embaixada-nova-delhi/embassy-of-brazil-in-new-delhi' },
      { label: 'Embassy of India, Brasília — advisory for Indian nationals visiting Brazil', url: 'https://eoibrasilia.gov.in/pdf/Advisory%20for%20Indian%20Nationals%20Visiting%20Brazil.pdf' },
      WIKI,
    ],
  },
  SA: {
    patch: {
      defaultCategory: 'sticker_required',
      processingTimeDays: { min: 5, max: 10 },
      conditionalUpgrades: {
        validUSVisaHolder: waiver('evisa', 90, 'Tourist eVisa (about SAR 535 incl. insurance) if your US visa is valid and has been used. Visa on arrival is also possible when flying Saudia or flynas.', 143),
        validSchengenHolder: waiver('evisa', 90, 'Tourist eVisa if your Schengen visa is valid and has been used to enter the Schengen area.', 143),
        validUKVisaHolder: waiver('evisa', 90, 'Tourist eVisa if your UK visa is valid and has been used.', 143),
      },
      tagline: 'Without a US, UK or Schengen visa, Indians apply via VFS Tasheer — or buy a Ministry of Tourism “package visa” (flights + licensed hotel).',
    },
    confidence: 'high',
    summary: 'Corrected: Indians without a US/UK/Schengen visa (or GCC residence) are not eligible for the standard tourist eVisa — embassy/VFS Tasheer visa or the new package visa applies.',
    sources: [
      { label: 'Outlook Traveller — Saudi visa options for Indian travellers', url: 'https://www.outlooktraveller.com/News/saudi-arabia-opens-up-more-visa-services-for-indian-travellers' },
      { label: 'Visit Saudi — official eVisa portal', url: 'https://visa.visitsaudi.com' },
      WIKI,
    ],
  },
  KR: {
    patch: {
      defaultCategory: 'sticker_required',
      baseFeeUsd: 38,
      baseFeeInr: 3400,
      processingTimeDays: { min: 7, max: 14 },
      conditionalUpgrades: {
        validUSVisaHolder: waiver('visa_free', 30, 'Only when travelling to or from the US (or Australia, Canada, New Zealand, Schengen) and meeting Korea’s conditions — check the embassy notice. Jeju Island is visa-free for 30 days for most travellers.'),
      },
      tagline: 'Visa via VFS/BLS in India (about 10 working days). Fill in the e-Arrival Card before landing. Jeju Island is visa-free for 30 days.',
    },
    confidence: 'high',
    summary: 'Corrected from eVisa to embassy visa: South Korea offers no eVisa or K-ETA to Indians. Single-entry fee ₹3,400 (June 2025), ~10 working days via VFS/BLS.',
    sources: [
      { label: 'Korean Embassy in India — visa notice', url: 'https://overseas.mofa.go.kr/in-en/brd/m_20446/view.do?seq=748786&page=1' },
      { label: 'Visa2Fly — South Korea visa for Indians 2026', url: 'https://visa2fly.com/blog/-South-Korea-Visa-for-Indians-2026' },
      WIKI,
    ],
  },
  RS: {
    patch: {
      defaultCategory: 'sticker_required',
      baseFeeUsd: 65,
      baseFeeInr: 5700,
      processingTimeDays: { min: 10, max: 20 },
      stayDurationDays: 90,
      conditionalUpgrades: {
        validSchengenHolder: waiver('visa_free', 90, 'Serbia generally admits holders of a valid multiple-entry Schengen visa without a Serbian visa — confirm with the Serbian embassy before travel.'),
        validUSVisaHolder: waiver('visa_free', 90, 'Serbia generally admits holders of a valid US visa without a Serbian visa — confirm with the Serbian embassy before travel.'),
        validUKVisaHolder: waiver('visa_free', 90, 'Serbia generally admits holders of a valid UK visa without a Serbian visa — confirm with the Serbian embassy before travel.'),
      },
      tagline: '',
    },
    confidence: 'medium',
    summary: 'Corrected from visa-free: Serbia’s Ministry of Foreign Affairs lists “visa required” for Indian ordinary passports. Waivers for US/UK/Schengen visa holders are reported but not confirmed on the MFA page.',
    sources: [{ label: 'Serbian Ministry of Foreign Affairs — visa regime for India', url: 'https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indija' }, WIKI],
  },
  LK: {
    patch: {
      defaultCategory: 'evisa',
      baseFeeUsd: 0,
      baseFeeInr: 0,
      processingTimeDays: { min: 0, max: 2 },
      stayDurationDays: 30,
      officialPortalUrl: 'https://www.eta.gov.lk',
      tagline: 'Free online ETA for Indians (double entry, 30 days) since 25 May 2026 — you still need to apply before flying.',
    },
    confidence: 'high',
    summary: 'Free ETA scheme for 40 countries including India, from 25 May 2026 — application still required before travel. Announced as a time-limited programme; recheck periodically.',
    sources: [
      { label: 'All India Radio — Sri Lanka free tourist visas programme', url: 'https://www.newsonair.gov.in/sri-lanka-will-introduce-6-month-programme-granting-free-tourist-visas-to-passport-holders-from-39-countries' },
      { label: 'Sri Lanka ETA — official portal', url: 'https://www.eta.gov.lk' },
    ],
  },
  QA: {
    patch: {
      defaultCategory: 'visa_free',
      stayDurationDays: 30,
      requiredDocuments: [
        'Passport valid for 6+ months',
        'Confirmed return ticket',
        'Hotel booked through the Discover Qatar website (required for the visa waiver)',
        'Proof of funds',
      ],
    },
    confidence: 'high',
    summary: 'Visa waiver on arrival for 30 days (extendable once), conditional on a return ticket and a hotel booked via Discover Qatar.',
    sources: [WIKI, { label: 'Visit Qatar — visa information', url: 'https://www.visitqatar.com/intl-en/practical-info/visas' }],
  },
  PH: {
    patch: {
      defaultCategory: 'visa_free',
      baseFeeUsd: 0,
      baseFeeInr: 0,
      processingTimeDays: { min: 0, max: 0 },
      stayDurationDays: 14,
      conditionalUpgrades: {
        validUSVisaHolder: waiver('visa_free', 30, 'Visa-free for 30 days (tourism) with a valid US, Japanese, Australian, Canadian, Schengen, Singapore or UK visa or residence permit.'),
        validSchengenHolder: waiver('visa_free', 30, 'Visa-free for 30 days (tourism) with a valid Schengen visa or residence permit.'),
        validUKVisaHolder: waiver('visa_free', 30, 'Visa-free for 30 days (tourism) with a valid UK visa or residence permit.'),
      },
    },
    confidence: 'high',
    summary: 'Visa-free 14 days for tourism since 8 June 2025 (not extendable); 30 days with a valid US/JP/AU/CA/Schengen/SG/UK visa.',
    sources: [
      { label: 'Philippine Embassy, New Delhi — visa-free privileges for Indian nationals', url: 'https://newdelhipe.dfa.gov.ph' },
      { label: 'Baker McKenzie — Philippines visa-free entry for Indian nationals', url: 'https://insightplus.bakermckenzie.com/bm/employment-compensation/philippines-visa-free-entry-for-indian-nationals' },
    ],
  },
  MV: {
    patch: {},
    confidence: 'high',
    summary: 'Confirmed: all tourists get a free 30-day visa on arrival; India’s 90-day visa-free arrangement covers business visits only.',
    sources: [{ label: 'Maldives Ministry of Foreign Affairs — visa-free access for Indian nationals (business)', url: 'https://www.foreign.gov.mv/index.php/en/media-center/news/visa-free-access-to-be-granted-for-indian-nationals-arriving-in-the-maldives-for-business-purposes' }],
  },
  AE: {
    patch: {
      conditionalUpgrades: {
        validUSVisaHolder: waiver('voa', 14, 'Visa on arrival (AED 100, 14 days, extendable once) with a US visa or green card valid 6+ months. Since Feb 2025 also for visas/residence of Singapore, Japan, South Korea, Australia, New Zealand and Canada.', 27),
        validSchengenHolder: waiver('voa', 14, 'Visa on arrival (AED 100, 14 days) with an EU/Schengen visa or residence permit valid 6+ months.', 27),
        validUKVisaHolder: waiver('voa', 14, 'Visa on arrival (AED 100, 14 days) with a UK visa or residence permit valid 6+ months.', 27),
      },
    },
    confidence: 'high',
    summary: 'Tourist visa applied online (ICP or via airlines such as Emirates, flydubai, IndiGo). Visa on arrival AED 100 / 14 days for holders of US, UK, EU visas — extended in Feb 2025 to six more countries.',
    sources: [
      { label: 'EY — UAE expands visa on arrival for Indian nationals', url: 'https://www.ey.com/en_gl/technical/tax-alerts/uae-expands-visa-on-arrival-facility-to-additional-categories-of-indian-nationals' },
      { label: 'Gulf News — UAE relaxes visa rules for Indians', url: 'https://gulfnews.com/business/tourism/uae-expands-visa-rules-for-indian-travellers-families-1.500037317' },
    ],
  },
  OM: {
    patch: {},
    confidence: 'high',
    summary: 'Confirmed: Oman eVisa online via the Royal Oman Police portal (1–3 working days). Visa-free entry for Indians holding a valid US, UK, Canada, Australia, Japan or Schengen visa. A new free 14-day visa (Aug 2026) has not yet listed India.',
    sources: [
      { label: 'Royal Oman Police — eVisa portal', url: 'https://evisa.rop.gov.om' },
      { label: 'Business Standard — Oman’s free 14-day tourist visa explained', url: 'https://www.business-standard.com/immigration/oman-s-free-14-day-tourist-visa-explained-can-indian-citizens-apply-126080500729_1.html' },
    ],
  },
  IR: {
    patch: {},
    confidence: 'high',
    summary: 'Confirmed: Iran’s visa waiver for Indians has been suspended since 22 Nov 2025 and remains suspended; a visa is required.',
    sources: [
      { label: 'Embassy of Iran, New Delhi', url: 'https://newdelhi.mfa.gov.ir/en/newsview/778368' },
      { label: 'Business Standard — Iran ends visa-free travel for Indians', url: 'https://www.business-standard.com/immigration/iran-ends-visa-free-travel-for-indians-what-travellers-must-know-now-125111800270_1.html' },
    ],
  },
  US: {
    patch: {
      tagline: 'B1/B2 visa fee is US$185; a further US$250 “visa integrity fee” was legislated in 2025 — check travel.state.gov for whether it applies when you apply.',
    },
    confidence: 'medium',
    summary: 'Visa fee US$185 confirmed. The One Big Beautiful Bill Act (July 2025) added a US$250 visa integrity fee for non-immigrant visas; implementation timing should be confirmed on travel.state.gov.',
    sources: [
      { label: 'US Department of State — visa fees', url: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html' },
      { label: 'Business Today — US $250 visa integrity fee and Indians', url: 'https://www.businesstoday.in/amp/nri/visa/story/us-visa-fee-rises-pay-250-security-on-tourist-student-h-1b-visas-impact-on-indians-483889-2025-07-09' },
    ],
  },
  GB: {
    patch: { baseFeeUsd: 182, baseFeeInr: 17551 },
    confidence: 'high',
    summary: 'Six-month Standard Visitor visa ₹17,551 (May 2026). The Home Office resets its INR rate quarterly — use the official fee calculator.',
    sources: [
      { label: 'UK Home Office — visa fee calculator', url: 'https://visa-fees.homeoffice.gov.uk' },
      { label: 'BankBazaar — UK visa fees in rupees', url: 'https://bankbazaar.com/visa/uk-visa-fees-in-indian-rupees.html' },
    ],
  },
  JP: {
    patch: {
      baseFeeUsd: 6,
      baseFeeInr: 500,
      applicationSteps: [
        'Apply through VFS Global Japan in India (Indian residents cannot use the online portal directly).',
        'Submit documents at the VFS centre; single-entry tourist visas are issued as an eVisa.',
        'You receive a “Visa Issuance Notice” by email — show it on your phone at check-in and immigration (printouts are not accepted).',
      ],
    },
    confidence: 'high',
    summary: 'Embassy fee ₹500 since 1 Apr 2026 (single or multiple entry) plus ₹800 VFS charge. Tourist eVisa issued after submission at VFS; notice must be shown on a phone.',
    sources: [
      { label: 'Business Today — Japan visa fee for Indians stays ₹500', url: 'https://www.businesstoday.in/nri/visa/story/japan-raised-visa-fees-globally-from-july-1-but-indians-to-still-pay-just-rs-500-heres-why-541464-2026-07-07' },
      { label: 'Business Today — Japan eVisa eligibility 2026', url: 'https://www.businesstoday.in/amp/nri/visa/story/planning-to-visit-japan-in-2026-evisa-eligibility-documents-fees-what-travellers-must-know-511416-2026-01-19' },
    ],
  },
  AU: {
    patch: { baseFeeUsd: 165, baseFeeInr: 16900, processingTimeDays: { min: 16, max: 42 } },
    confidence: 'medium',
    summary: 'Visitor visa (subclass 600) charge reported as AUD 250 for applications from 1 July 2026, plus biometrics at VFS. Median processing ~16 days, 90% within ~33 days.',
    sources: [
      { label: 'Australian Department of Home Affairs — Visitor visa (600)', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600' },
      { label: 'Visarun — Australia visa cost for Indians 2026', url: 'https://visarun.ai/blog/australia-visa-cost-and-fees-for-indians-2026' },
    ],
  },
  CA: {
    patch: { processingTimeDays: { min: 28, max: 99 } },
    confidence: 'medium',
    summary: 'Fee CAD 100 + CAD 85 biometrics confirmed. Processing for Indian applicants reported at ~83 days in 2026 — apply very early.',
    sources: [
      { label: 'Business Standard — Indians now wait 83 days for Canada visitor visas', url: 'https://www.business-standard.com/immigration/canada-visitor-visa-update-indians-now-wait-83-days-for-approval-126020401165_1.html' },
      { label: 'IRCC — visit Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html' },
    ],
  },
  VN: {
    patch: { processingTimeDays: { min: 3, max: 3 } },
    confidence: 'high',
    summary: 'eVisa US$25 single / US$50 multiple entry, up to 90 days, ~3 working days (fee schedule effective 1 Apr 2026).',
    sources: [
      { label: 'Vietnam eVisa — official portal', url: 'https://evisa.gov.vn' },
      { label: 'Happyfares — Vietnam visa for Indians 2026', url: 'https://happyfares.in/blog/vietnam-visa-for-indians-2026-e-visa-fees-how-to-apply/' },
    ],
  },

  // ── Corrections from the Timatic cross-check (not individually researched) ─
  AO: { patch: { defaultCategory: 'visa_free', baseFeeUsd: 0, baseFeeInr: 0, processingTimeDays: { min: 0, max: 0 }, stayDurationDays: 30 }, confidence: 'medium', summary: 'Corrected to visa-free: Angola exempted 98 countries including India in Sept 2023 (30 days).', sources: [WIKI] },
  KI: { patch: { defaultCategory: 'visa_free', baseFeeUsd: 0, baseFeeInr: 0, processingTimeDays: { min: 0, max: 0 }, stayDurationDays: 90 }, confidence: 'medium', summary: 'Corrected to visa-free (up to 90 days in 12 months).', sources: [WIKI] },
  RW: { patch: { defaultCategory: 'visa_free', baseFeeUsd: 0, baseFeeInr: 0, processingTimeDays: { min: 0, max: 0 }, stayDurationDays: 30 }, confidence: 'medium', summary: 'Corrected to visa-free (30 days). East Africa Tourist Visa (US$100) covers Kenya, Rwanda and Uganda.', sources: [WIKI] },
  IL: { patch: { defaultCategory: 'evisa', processingTimeDays: { min: 3, max: 10 } }, confidence: 'medium', summary: 'Corrected to eVisa: Israel launched an e-visa for Indian residents from 1 Jan 2025. Check travel advisories.', sources: [WIKI] },
  UA: { patch: { defaultCategory: 'evisa', stayDurationDays: 30, processingTimeDays: { min: 5, max: 10 } }, confidence: 'medium', summary: 'Corrected to eVisa: reintroduced for Indians from 17 Feb 2025. Airspace closed; government advisories recommend against travel.', sources: [WIKI] },
  MA: { patch: { defaultCategory: 'evisa', processingTimeDays: { min: 3, max: 7 } }, confidence: 'medium', summary: 'Corrected to eVisa (30 days) for Indian passport holders.', sources: [WIKI] },
  BS: {
    patch: {
      defaultCategory: 'evisa',
      processingTimeDays: { min: 5, max: 15 },
      conditionalUpgrades: {
        validUSVisaHolder: waiver('voa', 90, 'Visa on arrival with a valid US visa.'),
        validSchengenHolder: waiver('voa', 90, 'Visa on arrival with a valid Schengen visa.'),
        validUKVisaHolder: waiver('voa', 90, 'Visa on arrival with a valid UK visa.'),
      },
    },
    confidence: 'medium',
    summary: 'Corrected to eVisa; visa on arrival for holders of valid US, UK, Schengen or Canadian visas.',
    sources: [WIKI],
  },
  BY: {
    patch: {
      defaultCategory: 'evisa',
      baseFeeUsd: 80,
      baseFeeInr: 7000,
      processingTimeDays: { min: 3, max: 7 },
      conditionalUpgrades: { validSchengenHolder: waiver('visa_free', 30, 'Visa reported as waived for holders of a valid EU/Schengen visa — confirm before travel.') },
      tagline: 'eVisa via the “E-Pasluga” portal (decided within 7 days), valid for entry through Minsk and other listed checkpoints.',
    },
    confidence: 'low',
    summary: 'Corrected from visa-free to eVisa per Timatic. Fee not confirmed from an official source.',
    sources: [WIKI],
  },
  BO: { patch: { defaultCategory: 'sticker_required', processingTimeDays: { min: 10, max: 20 } }, confidence: 'medium', summary: 'Corrected: visa on arrival is no longer available to Indians (Apr 2025); apply online, then visit the embassy.', sources: [WIKI] },
  SV: { patch: { defaultCategory: 'sticker_required', processingTimeDays: { min: 10, max: 20 }, tagline: 'Visa required. Since Oct 2023 Indians also pay a ~US$1,000 entry/transit fee.' }, confidence: 'medium', summary: 'Corrected to visa required; the ~US$1,000 fee for Indian nationals still applies.', sources: [WIKI] },
  KH: { patch: { defaultCategory: 'voa', processingTimeDays: { min: 0, max: 0 } }, confidence: 'medium', summary: 'Visa on arrival (US$36) or eVisa both available; shown as on arrival.', sources: [WIKI] },
  ET: { patch: { defaultCategory: 'voa', processingTimeDays: { min: 0, max: 0 } }, confidence: 'medium', summary: 'eVisa or visa on arrival both available for Indians.', sources: [WIKI] },
  TZ: { patch: { defaultCategory: 'voa', processingTimeDays: { min: 0, max: 0 } }, confidence: 'medium', summary: 'eVisa or visa on arrival both available (90 days).', sources: [WIKI] },
  ZW: { patch: { defaultCategory: 'voa', processingTimeDays: { min: 0, max: 0 } }, confidence: 'medium', summary: 'eVisa or visa on arrival both available.', sources: [WIKI] },
  SL: { patch: { defaultCategory: 'voa', processingTimeDays: { min: 0, max: 0 }, stayDurationDays: 30 }, confidence: 'medium', summary: 'eVisa or visa on arrival both available.', sources: [WIKI] },
  LR: { patch: { defaultCategory: 'voa', processingTimeDays: { min: 2, max: 5 }, stayDurationDays: 90 }, confidence: 'medium', summary: 'Corrected to e-VOA: pre-approval online, visa issued on arrival.', sources: [WIKI] },
  MH: { patch: { defaultCategory: 'voa', processingTimeDays: { min: 0, max: 0 }, stayDurationDays: 90 }, confidence: 'medium', summary: 'Corrected to visa on arrival (90 days).', sources: [WIKI] },
  WS: { patch: { defaultCategory: 'voa', stayDurationDays: 90 }, confidence: 'medium', summary: 'Free entry permit on arrival (90 days).', sources: [WIKI] },
  KN: { patch: { defaultCategory: 'evisa', processingTimeDays: { min: 1, max: 3 } }, confidence: 'medium', summary: 'Electronic Travel Authorisation required before travel (3 months).', sources: [WIKI] },
  SC: { patch: { defaultCategory: 'evisa', baseFeeUsd: 11, baseFeeInr: 950, processingTimeDays: { min: 1, max: 3 } }, confidence: 'medium', summary: 'Seychelles Electronic Border System travel authorisation required before travel (visitor permit then issued free on arrival).', sources: [WIKI, { label: 'Seychelles Electronic Border System', url: 'https://seychelles.govtas.com' }] },
  CD: { patch: { defaultCategory: 'evisa', stayDurationDays: 7 }, confidence: 'medium', summary: 'Corrected to eVisa (7 days).', sources: [WIKI] },
  TD: { patch: { defaultCategory: 'evisa' }, confidence: 'medium', summary: 'Corrected to eVisa.', sources: [WIKI] },
  LY: { patch: { defaultCategory: 'evisa' }, confidence: 'medium', summary: 'Corrected to eVisa. The Government of India advises against travel to Libya.', sources: [WIKI] },
  SY: { patch: { defaultCategory: 'evisa' }, confidence: 'medium', summary: 'Corrected to eVisa. Government advisories recommend against all travel.', sources: [WIKI] },
  VE: { patch: { defaultCategory: 'evisa' }, confidence: 'medium', summary: 'Corrected to eVisa.', sources: [WIKI] },
  EC: { patch: { defaultCategory: 'evisa' }, confidence: 'medium', summary: 'Corrected to online visa.', sources: [WIKI] },
  MZ: { patch: { defaultCategory: 'evisa', processingTimeDays: { min: 3, max: 7 } }, confidence: 'medium', summary: 'Corrected to eVisa (on-arrival only with SENAMI pre-approval).', sources: [WIKI] },
  NA: { patch: { defaultCategory: 'evisa', processingTimeDays: { min: 3, max: 7 } }, confidence: 'medium', summary: 'Corrected to eVisa (introduced April 2025).', sources: [WIKI] },
  LS: { patch: { defaultCategory: 'sticker_required', processingTimeDays: { min: 10, max: 20 } }, confidence: 'medium', summary: 'Corrected to visa required.', sources: [WIKI] },
  SB: { patch: { defaultCategory: 'sticker_required', baseFeeUsd: 50, baseFeeInr: 4400, processingTimeDays: { min: 10, max: 20 } }, confidence: 'low', summary: 'Corrected to visa required. Fee is an estimate — not confirmed from an official source.', sources: [WIKI] },
  TO: { patch: { defaultCategory: 'sticker_required', baseFeeUsd: 50, baseFeeInr: 4400, processingTimeDays: { min: 10, max: 20 } }, confidence: 'low', summary: 'Corrected to visa required. Fee is an estimate — not confirmed from an official source.', sources: [WIKI] },
  RU: { patch: { stayDurationDays: 30 }, confidence: 'medium', summary: 'Unified eVisa now allows stays of up to 30 days.', sources: [WIKI, { label: 'Russian unified e-visa portal', url: 'https://evisa.kdmid.ru' }] },
  PG: { patch: { stayDurationDays: 30 }, confidence: 'medium', summary: 'Stay corrected to 30 days.', sources: [WIKI] },
  KG: { patch: { stayDurationDays: 60 }, confidence: 'medium', summary: 'Stay corrected to 60 days.', sources: [WIKI] },
  VU: { patch: { stayDurationDays: 120 }, confidence: 'medium', summary: 'Stay corrected to 120 days.', sources: [WIKI] },
  VC: { patch: { stayDurationDays: 90 }, confidence: 'medium', summary: 'Stay corrected to 3 months.', sources: [WIKI] },
  DJ: { patch: { stayDurationDays: 90 }, confidence: 'medium', summary: 'Stay corrected to 90 days.', sources: [WIKI] },
  GA: { patch: { stayDurationDays: 90 }, confidence: 'medium', summary: 'Stay corrected to 90 days.', sources: [WIKI] },
  GN: { patch: { stayDurationDays: 90 }, confidence: 'medium', summary: 'Stay corrected to 90 days.', sources: [WIKI] },

  // ── Kept as-is despite a Timatic difference (explained) ──────────────────
  AF: { patch: {}, confidence: 'low', summary: 'Timatic lists an eVisa, but it excludes applicants resident in India — kept as embassy visa. Government advisories recommend against travel.', sources: [WIKI] },
  SG: { patch: { tagline: 'Visa applied online through an authorised visa agent (or a local sponsor); issued as an e-visa.' }, confidence: 'medium', summary: 'Timatic says “visa required”; in practice Indians apply online via authorised agents and receive an e-visa, so it is shown as eVisa.', sources: [WIKI] },
  NZ: { patch: {}, confidence: 'medium', summary: 'Visitor visa is applied for online with Immigration New Zealand (no embassy visit), so it is shown as eVisa.', sources: [WIKI, { label: 'Immigration New Zealand — visitor visa', url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/visitor-visa' }] },
  MD: { patch: {}, confidence: 'medium', summary: 'Visa applied for online (e-visa portal); visa-free with valid US, UK or Schengen visa — kept as eVisa.', sources: [WIKI] },
  TN: { patch: { tagline: 'Visa required — except groups of five or more booking through a travel agency with return tickets and hotel reservations.' }, confidence: 'medium', summary: 'Visa-free only for agency groups of 5+; individuals need a visa.', sources: [WIKI] },
  BH: { patch: {}, confidence: 'low', summary: 'Timatic lists eVisa or visa on arrival; on-arrival eligibility for Indians appears conditional — kept as eVisa.', sources: [WIKI] },
  MN: { patch: {}, confidence: 'low', summary: 'Timatic lists eVisa or visa on arrival; kept as eVisa pending confirmation.', sources: [WIKI] },
  MM: { patch: {}, confidence: 'low', summary: 'Timatic lists eVisa or visa on arrival; kept as eVisa. Check travel advisories.', sources: [WIKI] },
};

/** Schengen states share one rule set. */
for (const code of ['AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'DE', 'GR', 'HU', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH', 'FR', 'IS']) {
  COUNTRY_RESEARCH[code] ??= SCHENGEN_PATCH;
}

/** Countries whose entry type matched Timatic and weren't otherwise researched. */
export const DEFAULT_RESEARCH: Omit<CountryResearch, 'patch'> = {
  confidence: 'medium',
  summary: 'Entry type cross-checked against IATA Timatic data (Oct 2026) — matches. Fee and processing time not independently re-checked.',
  sources: [WIKI],
};

/** Not in the main Timatic table — not cross-checked. */
export const NOT_CROSS_CHECKED = new Set(['HK', 'MO', 'TW', 'XK', 'CK', 'NU']);

export const HUB_RESEARCH: Record<string, { patch: Partial<TransitHubProfile>; confidence: ResearchRecord['confidence']; summary: string; sources: ResearchRecord['sources'] }> = {
  FRA: {
    patch: {
      transitVisaNeededForIndians: false,
      transitVisaExemptWith: [],
      transitVisaType: 'No airport transit visa needed (since 3 June 2026)',
      transitVisaCostInr: 0,
      transitVisaCostUsd: 0,
      rulesSummary:
        'Since 3 June 2026 Indian passport holders no longer need an airport transit visa at Frankfurt (also Munich, Berlin; Düsseldorf and Hamburg with limits) — provided you stay airside and fly on to a non-Schengen destination. Collecting bags, changing airports or leaving the airport needs a Schengen visa.',
      criticalWarnings: [
        'Airside only: separate tickets with checked bags require a Schengen visa.',
        'Your onward flight must leave the Schengen area (e.g. to the US, Canada or UK).',
      ],
    },
    confidence: 'high',
    summary: 'German airport transit visa requirement for Indians removed from 3 June 2026 (German Federal Foreign Office).',
    sources: [
      { label: 'The Local Germany — visa-free transit for Indian travellers', url: 'https://www.thelocal.de/20260113/germany-to-allow-visa-free-transit-for-indian-travellers' },
      { label: 'Wego — Indian nationals no longer need German ATV', url: 'https://blog.wego.com/indian-nationals-no-longer-need-airport-transit-visa-for-german-layovers/' },
    ],
  },
  IST: {
    patch: {
      criticalWarnings: [
        'Flying on to Mexico, Panama, Colombia or Venezuela? Indians need a free Electronic Airport Transit Visa (e-ATV) from evisa.gov.tr — even when staying airside.',
        'Switching between Istanbul Airport (IST) and Sabiha Gökçen (SAW) requires a Turkish visa.',
        'Self-transfers between separate tickets with checked bags require passing border control — you need a Turkish visa.',
        'Turkish eVisa is conditional for Indians: you must hold a valid US, UK, Schengen or Ireland visa/residence permit.',
        'Do not book separate tickets with under 3.5 hours between flights at IST.',
      ],
    },
    confidence: 'high',
    summary: 'Turkish embassy notice: e-ATV required for Indians transiting IST to Mexico, Panama, Colombia and Venezuela (free, since 15 Apr 2024).',
    sources: [
      { label: 'Embassy of Türkiye, New Delhi — e-ATV announcement', url: 'https://newdelhi-emb.mfa.gov.tr/Mission/ShowAnnouncement/409495' },
      { label: 'Outlook Traveller — e-transit visa for Istanbul layovers', url: 'https://www.outlooktraveller.com/News/electronic-transit-visa-now-needed-for-istanbul-airport-layovers' },
    ],
  },
  KUL: {
    patch: {
      criticalWarnings: [
        'Complete the Malaysia Digital Arrival Card (MDAC) within 3 days before arrival — also for self-transfers.',
        'Carry proof of onward ticket, hotel and funds: KLIA has been refusing entry to Indians who can’t show them.',
        'AirAsia flies from KLIA Terminal 2 — check both flights’ terminals.',
      ],
    },
    confidence: 'high',
    summary: 'Malaysia visa-free entry for Indians runs to 31 Dec 2026; MDAC mandatory; entry refusals reported at KLIA.',
    sources: [{ label: 'Gulf News — Indians denied entry under Malaysia visa-free scheme', url: 'https://gulfnews.com/business/tourism/why-are-indians-denied-entry-into-malaysia-under-30-day-visa-free-entry-scheme-1.500249807' }],
  },
  BKK: {
    patch: {
      transitVisaType: 'Visa-free entry for Indians (30 days from 15 Sept 2026)',
    },
    confidence: 'high',
    summary: 'Thailand visa exemption for Indians is 30 days from 15 Sept 2026; TDAC required.',
    sources: [{ label: 'Royal Thai Embassy, New Delhi', url: 'https://newdelhi.thaiembassy.org/en/content/latest-update-on-revision-to-thailand-s-visa-exemp' }],
  },
  CMB: {
    patch: { transitVisaType: 'Free online ETA for Indians (since 25 May 2026)' },
    confidence: 'high',
    summary: 'Sri Lanka free ETA for Indians from 25 May 2026.',
    sources: [{ label: 'All India Radio — Sri Lanka free tourist visas', url: 'https://www.newsonair.gov.in/sri-lanka-will-introduce-6-month-programme-granting-free-tourist-visas-to-passport-holders-from-39-countries' }],
  },
};
