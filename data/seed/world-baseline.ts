import type { BaseVisaCategory, Continent, HeldVisa } from '@/types/visa';

/**
 * Baseline visa rules for Indian (ordinary) passport holders for countries
 * not yet covered by the hand-curated profiles in data/destinations.json.
 *
 * Compiled from public sources (official immigration portals, MEA/embassy
 * notices) and deliberately conservative. EVERY row is imported with
 * lastVerifiedAt = null so the site labels it "Unverified" until an editor
 * checks it in /admin against the official portal.
 *
 * Row: [code, name, continent, capital, category, stayDays, feeUsd,
 *       processingMinDays, processingMaxDays, officialUrl, airports, extras?]
 */
type Waiver = [Exclude<BaseVisaCategory, 'sticker_required'>, number, number?]; // [category, stayDays, feeUsd?]
interface Extras {
  schengen?: boolean;
  waivers?: Partial<Record<HeldVisa, Waiver>>;
  note?: string;
}
export type BaselineRow = [
  string, string, Continent, string, BaseVisaCategory, number, number, number, number, string, string, Extras?,
];

const SCHENGEN_URL = 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en';
const S: Extras = { schengen: true };

export const WORLD_BASELINE: BaselineRow[] = [
  // ── Asia
  ['CN', 'China', 'Asia', 'Beijing', 'sticker_required', 30, 35, 4, 10, 'https://www.visaforchina.cn', 'PEK PVG'],
  ['HK', 'Hong Kong', 'Asia', 'Hong Kong', 'evisa', 14, 0, 0, 2, 'https://www.immd.gov.hk/eng/services/visas/pre-arrival_registration_for_indian_nationals.html', 'HKG', { note: 'Free online Pre-Arrival Registration (PAR) required before travel.' }],
  ['MO', 'Macao', 'Asia', 'Macao', 'visa_free', 30, 0, 0, 0, 'https://www.fsm.gov.mo/psp/eng/psp_left_4.html', 'MFM'],
  ['TW', 'Taiwan', 'Asia', 'Taipei', 'evisa', 30, 50, 3, 7, 'https://visawebapp.boca.gov.tw', 'TPE'],
  ['MN', 'Mongolia', 'Asia', 'Ulaanbaatar', 'evisa', 30, 25, 3, 7, 'https://evisa.mn', 'UBN'],
  ['KH', 'Cambodia', 'Asia', 'Phnom Penh', 'evisa', 30, 36, 3, 3, 'https://www.evisa.gov.kh', 'KTI REP'],
  ['LA', 'Laos', 'Asia', 'Vientiane', 'voa', 30, 40, 0, 3, 'https://laoevisa.gov.la', 'VTE'],
  ['MM', 'Myanmar', 'Asia', 'Naypyidaw', 'evisa', 28, 50, 3, 5, 'https://evisa.moip.gov.mm', 'RGN', { note: 'Check travel advisories — parts of the country are unsafe.' }],
  ['BN', 'Brunei', 'Asia', 'Bandar Seri Begawan', 'sticker_required', 14, 20, 3, 7, 'https://www.immigration.gov.bn', 'BWN'],
  ['TL', 'Timor-Leste', 'Asia', 'Dili', 'voa', 30, 30, 0, 0, 'https://www.migracao.gov.tl', 'DIL'],
  ['BD', 'Bangladesh', 'Asia', 'Dhaka', 'sticker_required', 30, 0, 5, 10, 'https://visa.gov.bd', 'DAC'],
  ['PK', 'Pakistan', 'Asia', 'Islamabad', 'sticker_required', 30, 0, 30, 60, 'https://visa.nadra.gov.pk', 'ISB', { note: 'Visa issuance to Indian nationals is heavily restricted; check current status before planning.' }],
  ['AF', 'Afghanistan', 'Asia', 'Kabul', 'sticker_required', 30, 100, 10, 30, 'https://www.mfa.gov.af', 'KBL', { note: 'Government travel advisories recommend against all travel.' }],
  ['KG', 'Kyrgyzstan', 'Asia', 'Bishkek', 'evisa', 30, 51, 3, 5, 'https://www.evisa.e-gov.kg', 'FRU'],
  ['TJ', 'Tajikistan', 'Asia', 'Dushanbe', 'evisa', 60, 30, 2, 5, 'https://www.evisa.tj', 'DYU'],
  ['TM', 'Turkmenistan', 'Asia', 'Ashgabat', 'sticker_required', 10, 155, 20, 30, 'https://www.mfa.gov.tm', 'ASB', { note: 'Letter of invitation through a licensed agency required.' }],
  ['AM', 'Armenia', 'Asia', 'Yerevan', 'evisa', 21, 6, 2, 5, 'https://evisa.mfa.am', 'EVN'],

  // ── Middle East
  ['BH', 'Bahrain', 'Middle East', 'Manama', 'evisa', 14, 26, 3, 5, 'https://www.evisa.gov.bh', 'BAH'],
  ['KW', 'Kuwait', 'Middle East', 'Kuwait City', 'sticker_required', 30, 10, 5, 15, 'https://evisa.moi.gov.kw', 'KWI'],
  ['JO', 'Jordan', 'Middle East', 'Amman', 'voa', 30, 56, 0, 0, 'https://eservices.moi.gov.jo', 'AMM', { note: 'Jordan Pass (~JOD 70+) waives the visa fee if you stay 3+ nights.' }],
  ['LB', 'Lebanon', 'Middle East', 'Beirut', 'sticker_required', 30, 50, 7, 14, 'https://www.general-security.gov.lb', 'BEY', { note: 'Check travel advisories before planning.' }],
  ['IL', 'Israel', 'Middle East', 'Jerusalem', 'sticker_required', 90, 30, 10, 21, 'https://www.gov.il/en/departments/topics/visas', 'TLV', { note: 'Check travel advisories before planning.' }],
  ['IR', 'Iran', 'Middle East', 'Tehran', 'evisa', 30, 60, 5, 10, 'https://e_visa.mfa.ir', 'IKA', { note: 'The 2024 visa-free scheme for Indians was suspended in Nov 2025 — apply for an eVisa reference number in advance.' }],
  ['IQ', 'Iraq', 'Middle East', 'Baghdad', 'evisa', 30, 77, 3, 7, 'https://evisa.iq', 'BGW'],
  ['SY', 'Syria', 'Middle East', 'Damascus', 'sticker_required', 15, 50, 14, 30, 'https://www.mofaex.gov.sy', 'DAM', { note: 'Government travel advisories recommend against all travel.' }],
  ['YE', 'Yemen', 'Middle East', 'Sanaa', 'sticker_required', 30, 60, 14, 30, 'https://www.mofa-ye.org', 'ADE', { note: 'Indian nationals are barred from travelling to Yemen by the Government of India.' }],

  // ── Europe (Schengen)
  ['AT', 'Austria', 'Europe', 'Vienna', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'VIE', S],
  ['BE', 'Belgium', 'Europe', 'Brussels', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'BRU', S],
  ['BG', 'Bulgaria', 'Europe', 'Sofia', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'SOF', S],
  ['HR', 'Croatia', 'Europe', 'Zagreb', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'ZAG', S],
  ['CZ', 'Czechia', 'Europe', 'Prague', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'PRG', S],
  ['DK', 'Denmark', 'Europe', 'Copenhagen', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'CPH', S],
  ['EE', 'Estonia', 'Europe', 'Tallinn', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'TLL', S],
  ['FI', 'Finland', 'Europe', 'Helsinki', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'HEL', S],
  ['DE', 'Germany', 'Europe', 'Berlin', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'FRA MUC', S],
  ['GR', 'Greece', 'Europe', 'Athens', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'ATH', S],
  ['HU', 'Hungary', 'Europe', 'Budapest', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'BUD', S],
  ['IT', 'Italy', 'Europe', 'Rome', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'FCO MXP', S],
  ['LV', 'Latvia', 'Europe', 'Riga', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'RIX', S],
  ['LT', 'Lithuania', 'Europe', 'Vilnius', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'VNO', S],
  ['LU', 'Luxembourg', 'Europe', 'Luxembourg', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'LUX', S],
  ['MT', 'Malta', 'Europe', 'Valletta', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'MLA', S],
  ['NL', 'Netherlands', 'Europe', 'Amsterdam', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'AMS', S],
  ['NO', 'Norway', 'Europe', 'Oslo', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'OSL', S],
  ['PL', 'Poland', 'Europe', 'Warsaw', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'WAW', S],
  ['PT', 'Portugal', 'Europe', 'Lisbon', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'LIS', S],
  ['RO', 'Romania', 'Europe', 'Bucharest', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'OTP', S],
  ['SK', 'Slovakia', 'Europe', 'Bratislava', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'BTS', S],
  ['SI', 'Slovenia', 'Europe', 'Ljubljana', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'LJU', S],
  ['ES', 'Spain', 'Europe', 'Madrid', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'MAD BCN', S],
  ['SE', 'Sweden', 'Europe', 'Stockholm', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'ARN', S],
  ['CH', 'Switzerland', 'Europe', 'Bern', 'sticker_required', 90, 100, 15, 45, SCHENGEN_URL, 'ZRH', S],

  // ── Europe (non-Schengen)
  ['IE', 'Ireland', 'Europe', 'Dublin', 'sticker_required', 90, 66, 15, 56, 'https://www.irishimmigration.ie', 'DUB', { waivers: { UK: ['visa_free', 90] }, note: 'Short Stay Visa Waiver: with a valid UK visa you may enter Ireland visa-free, but only after first entering the UK.' }],
  ['CY', 'Cyprus', 'Europe', 'Nicosia', 'sticker_required', 90, 90, 10, 30, 'https://www.mfa.gov.cy', 'LCA', { waivers: { Schengen: ['visa_free', 90] } }],
  ['RS', 'Serbia', 'Europe', 'Belgrade', 'visa_free', 30, 0, 0, 0, 'https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-regime', 'BEG'],
  ['ME', 'Montenegro', 'Europe', 'Podgorica', 'sticker_required', 30, 70, 10, 20, 'https://www.gov.me/en/mfa', 'TGD', { waivers: { US: ['visa_free', 30], UK: ['visa_free', 30], Schengen: ['visa_free', 30] } }],
  ['MK', 'North Macedonia', 'Europe', 'Skopje', 'sticker_required', 15, 70, 10, 20, 'https://www.mfa.gov.mk', 'SKP', { waivers: { US: ['visa_free', 15], UK: ['visa_free', 15], Schengen: ['visa_free', 15] } }],
  ['BA', 'Bosnia and Herzegovina', 'Europe', 'Sarajevo', 'sticker_required', 30, 70, 10, 20, 'https://www.mvp.gov.ba', 'SJJ', { waivers: { US: ['visa_free', 30], UK: ['visa_free', 30], Schengen: ['visa_free', 30] } }],
  ['XK', 'Kosovo', 'Europe', 'Pristina', 'sticker_required', 15, 45, 10, 20, 'https://www.mfa-ks.net', 'PRN', { waivers: { US: ['visa_free', 15], UK: ['visa_free', 15], Schengen: ['visa_free', 15] } }],
  ['MD', 'Moldova', 'Europe', 'Chișinău', 'evisa', 90, 90, 5, 10, 'https://www.evisa.gov.md', 'RMO', { waivers: { US: ['visa_free', 90], UK: ['visa_free', 90], Schengen: ['visa_free', 90] } }],
  ['UA', 'Ukraine', 'Europe', 'Kyiv', 'sticker_required', 90, 65, 10, 20, 'https://mfa.gov.ua', 'KBP', { note: 'Airspace closed; government advisories recommend against travel.' }],
  ['BY', 'Belarus', 'Europe', 'Minsk', 'visa_free', 30, 0, 0, 0, 'https://www.mfa.gov.by', 'MSQ', { note: 'Visa-free only when arriving and departing via Minsk National Airport (not on flights from Russia).' }],
  ['RU', 'Russia', 'Europe', 'Moscow', 'evisa', 16, 52, 4, 4, 'https://evisa.kdmid.ru', 'SVO'],

  // ── Americas
  ['CA', 'Canada', 'Americas', 'Ottawa', 'sticker_required', 180, 135, 30, 120, 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html', 'YYZ YVR'],
  ['CL', 'Chile', 'Americas', 'Santiago', 'sticker_required', 90, 50, 15, 30, 'https://tramites.minrel.gov.cl', 'SCL'],
  ['EC', 'Ecuador', 'Americas', 'Quito', 'sticker_required', 90, 50, 10, 20, 'https://www.cancilleria.gob.ec', 'UIO'],
  ['BO', 'Bolivia', 'Americas', 'Sucre', 'voa', 30, 30, 0, 0, 'https://www.migracion.gob.bo', 'VVI'],
  ['PY', 'Paraguay', 'Americas', 'Asunción', 'sticker_required', 90, 65, 10, 20, 'https://www.mre.gov.py', 'ASU'],
  ['UY', 'Uruguay', 'Americas', 'Montevideo', 'sticker_required', 90, 50, 10, 20, 'https://www.gub.uy/ministerio-relaciones-exteriores', 'MVD'],
  ['VE', 'Venezuela', 'Americas', 'Caracas', 'sticker_required', 90, 60, 15, 30, 'https://www.mppre.gob.ve', 'CCS', { note: 'Check travel advisories before planning.' }],
  ['GY', 'Guyana', 'Americas', 'Georgetown', 'sticker_required', 30, 25, 7, 14, 'https://www.minfor.gov.gy', 'GEO'],
  ['SR', 'Suriname', 'Americas', 'Paramaribo', 'evisa', 90, 50, 1, 3, 'https://suriname.vfsevisa.com', 'PBM'],
  ['CR', 'Costa Rica', 'Americas', 'San José', 'sticker_required', 30, 52, 30, 60, 'https://www.migracion.go.cr', 'SJO', { waivers: { US: ['visa_free', 30], Schengen: ['visa_free', 30] } }],
  ['PA', 'Panama', 'Americas', 'Panama City', 'sticker_required', 30, 50, 15, 30, 'https://www.migracion.gob.pa', 'PTY', { waivers: { US: ['visa_free', 30], UK: ['visa_free', 30], Schengen: ['visa_free', 30] } }],
  ['GT', 'Guatemala', 'Americas', 'Guatemala City', 'sticker_required', 90, 50, 15, 30, 'https://igm.gob.gt', 'GUA', { waivers: { US: ['visa_free', 90], Schengen: ['visa_free', 90] } }],
  ['HN', 'Honduras', 'Americas', 'Tegucigalpa', 'sticker_required', 90, 50, 15, 30, 'https://inm.gob.hn', 'SAP', { waivers: { US: ['visa_free', 90], Schengen: ['visa_free', 90] } }],
  ['SV', 'El Salvador', 'Americas', 'San Salvador', 'voa', 90, 1130, 0, 0, 'https://www.migracion.gob.sv', 'SAL', { note: 'Indian nationals pay a ~US$1,130 entry fee on arrival (introduced 2023).' }],
  ['NI', 'Nicaragua', 'Americas', 'Managua', 'sticker_required', 30, 50, 15, 30, 'https://www.migob.gob.ni', 'MGA'],
  ['BZ', 'Belize', 'Americas', 'Belmopan', 'sticker_required', 30, 50, 10, 20, 'https://www.immigration.gov.bz', 'BZE', { waivers: { US: ['visa_free', 30] } }],
  ['CU', 'Cuba', 'Americas', 'Havana', 'evisa', 90, 50, 1, 5, 'https://www.evisacuba.cu', 'HAV', { note: 'Tourist card (eVisa) plus mandatory D\'Viajeros online form.' }],
  ['DO', 'Dominican Republic', 'Americas', 'Santo Domingo', 'sticker_required', 30, 100, 15, 30, 'https://www.mirex.gob.do', 'SDQ PUJ', { waivers: { US: ['visa_free', 30], UK: ['visa_free', 30], Schengen: ['visa_free', 30] } }],
  ['JM', 'Jamaica', 'Americas', 'Kingston', 'visa_free', 30, 0, 0, 0, 'https://www.pica.gov.jm', 'KIN MBJ'],
  ['BS', 'Bahamas', 'Americas', 'Nassau', 'sticker_required', 90, 50, 15, 30, 'https://www.immigration.gov.bs', 'NAS'],
  ['BB', 'Barbados', 'Americas', 'Bridgetown', 'visa_free', 90, 0, 0, 0, 'https://www.foreign.gov.bb', 'BGI'],
  ['TT', 'Trinidad and Tobago', 'Americas', 'Port of Spain', 'visa_free', 90, 0, 0, 0, 'https://immigration.gov.tt', 'POS'],
  ['HT', 'Haiti', 'Americas', 'Port-au-Prince', 'visa_free', 90, 0, 0, 0, 'https://www.mae.gouv.ht', 'PAP', { note: 'Government travel advisories recommend against all travel.' }],
  ['DM', 'Dominica', 'Americas', 'Roseau', 'visa_free', 180, 0, 0, 0, 'https://www.dominica.gov.dm', 'DOM'],
  ['GD', 'Grenada', 'Americas', "St. George's", 'visa_free', 90, 0, 0, 0, 'https://www.gov.gd', 'GND'],
  ['KN', 'Saint Kitts and Nevis', 'Americas', 'Basseterre', 'visa_free', 90, 0, 0, 0, 'https://www.gov.kn', 'SKB', { note: 'Online ETA form required before travel.' }],
  ['VC', 'Saint Vincent and the Grenadines', 'Americas', 'Kingstown', 'visa_free', 30, 0, 0, 0, 'https://www.gov.vc', 'SVD'],
  ['LC', 'Saint Lucia', 'Americas', 'Castries', 'voa', 42, 50, 0, 0, 'https://www.govt.lc', 'UVF'],
  ['AG', 'Antigua and Barbuda', 'Americas', "St. John's", 'evisa', 30, 100, 5, 10, 'https://evisa.immigration.gov.ag', 'ANU'],

  // ── Africa
  ['ET', 'Ethiopia', 'Africa', 'Addis Ababa', 'evisa', 30, 82, 3, 3, 'https://www.evisa.gov.et', 'ADD'],
  ['MA', 'Morocco', 'Africa', 'Rabat', 'sticker_required', 30, 80, 10, 20, 'https://www.acces-maroc.ma', 'CMN RAK', { waivers: { US: ['evisa', 30, 80], UK: ['evisa', 30, 80], Schengen: ['evisa', 30, 80] } }],
  ['TN', 'Tunisia', 'Africa', 'Tunis', 'sticker_required', 30, 40, 10, 20, 'https://www.diplomatie.gov.tn', 'TUN'],
  ['DZ', 'Algeria', 'Africa', 'Algiers', 'sticker_required', 30, 70, 15, 30, 'https://www.mae.gov.dz', 'ALG'],
  ['LY', 'Libya', 'Africa', 'Tripoli', 'sticker_required', 30, 100, 15, 30, 'https://www.foreign.gov.ly', 'MJI', { note: 'Indian nationals are advised by the Government of India not to travel to Libya.' }],
  ['SD', 'Sudan', 'Africa', 'Khartoum', 'sticker_required', 30, 100, 15, 30, 'https://www.mofa.gov.sd', 'KRT', { note: 'Government travel advisories recommend against all travel.' }],
  ['SS', 'South Sudan', 'Africa', 'Juba', 'evisa', 30, 100, 5, 10, 'https://evisa.gov.ss', 'JUB', { note: 'Check travel advisories before planning.' }],
  ['ER', 'Eritrea', 'Africa', 'Asmara', 'sticker_required', 30, 70, 15, 30, 'https://www.shabait.com', 'ASM'],
  ['DJ', 'Djibouti', 'Africa', 'Djibouti', 'evisa', 30, 23, 3, 5, 'https://www.evisa.gouv.dj', 'JIB'],
  ['SO', 'Somalia', 'Africa', 'Mogadishu', 'evisa', 30, 64, 3, 7, 'https://evisa.gov.so', 'MGQ', { note: 'Government travel advisories recommend against all travel.' }],
  ['UG', 'Uganda', 'Africa', 'Kampala', 'evisa', 90, 50, 3, 5, 'https://visas.immigration.go.ug', 'EBB'],
  ['TZ', 'Tanzania', 'Africa', 'Dodoma', 'evisa', 90, 50, 5, 10, 'https://visa.immigration.go.tz', 'DAR JRO ZNZ'],
  ['RW', 'Rwanda', 'Africa', 'Kigali', 'voa', 30, 50, 0, 0, 'https://www.migration.gov.rw', 'KGL'],
  ['BI', 'Burundi', 'Africa', 'Gitega', 'voa', 30, 90, 0, 0, 'https://www.pafe.gov.bi', 'BJM'],
  ['CD', 'DR Congo', 'Africa', 'Kinshasa', 'sticker_required', 30, 150, 10, 20, 'https://www.dgm.cd', 'FIH'],
  ['CG', 'Republic of the Congo', 'Africa', 'Brazzaville', 'sticker_required', 30, 100, 10, 20, 'https://www.mae.gouv.cg', 'BZV'],
  ['GA', 'Gabon', 'Africa', 'Libreville', 'evisa', 30, 85, 3, 5, 'https://evisa.dgdi.ga', 'LBV'],
  ['CM', 'Cameroon', 'Africa', 'Yaoundé', 'evisa', 30, 100, 5, 10, 'https://www.evisacam.cm', 'NSI'],
  ['NG', 'Nigeria', 'Africa', 'Abuja', 'evisa', 30, 160, 2, 5, 'https://evisa.immigration.gov.ng', 'LOS'],
  ['GH', 'Ghana', 'Africa', 'Accra', 'sticker_required', 60, 60, 5, 15, 'https://www.gis.gov.gh', 'ACC'],
  ['CI', "Côte d'Ivoire", 'Africa', 'Yamoussoukro', 'evisa', 90, 85, 2, 5, 'https://www.snedai.com', 'ABJ'],
  ['SN', 'Senegal', 'Africa', 'Dakar', 'visa_free', 90, 0, 0, 0, 'https://www.diplomatie.gouv.sn', 'DSS'],
  ['GM', 'Gambia', 'Africa', 'Banjul', 'visa_free', 90, 0, 0, 0, 'https://www.gid.gov.gm', 'BJL'],
  ['GN', 'Guinea', 'Africa', 'Conakry', 'evisa', 30, 80, 3, 5, 'https://www.paf.gov.gn', 'CKY'],
  ['SL', 'Sierra Leone', 'Africa', 'Freetown', 'evisa', 30, 80, 2, 5, 'https://www.evisa.sl', 'FNA'],
  ['LR', 'Liberia', 'Africa', 'Monrovia', 'sticker_required', 30, 100, 10, 20, 'https://www.mofa.gov.lr', 'ROB'],
  ['ML', 'Mali', 'Africa', 'Bamako', 'sticker_required', 30, 80, 10, 20, 'https://www.maliens-exterieur.gouv.ml', 'BKO', { note: 'Check travel advisories before planning.' }],
  ['BF', 'Burkina Faso', 'Africa', 'Ouagadougou', 'evisa', 30, 90, 3, 5, 'https://www.visaburkina.bf', 'OUA', { note: 'Check travel advisories before planning.' }],
  ['NE', 'Niger', 'Africa', 'Niamey', 'sticker_required', 30, 80, 10, 20, 'https://www.diplomatie.gouv.ne', 'NIM', { note: 'Check travel advisories before planning.' }],
  ['BJ', 'Benin', 'Africa', 'Porto-Novo', 'evisa', 30, 50, 2, 3, 'https://evisa.bj', 'COO'],
  ['TG', 'Togo', 'Africa', 'Lomé', 'evisa', 15, 50, 3, 5, 'https://voyage.gouv.tg', 'LFW'],
  ['TD', 'Chad', 'Africa', "N'Djamena", 'sticker_required', 30, 100, 10, 20, 'https://www.diplomatie.gouv.td', 'NDJ'],
  ['CF', 'Central African Republic', 'Africa', 'Bangui', 'sticker_required', 30, 100, 10, 20, 'https://www.diplomatie.gouv.cf', 'BGF', { note: 'Government travel advisories recommend against all travel.' }],
  ['GQ', 'Equatorial Guinea', 'Africa', 'Malabo', 'evisa', 30, 100, 5, 10, 'https://www.evisa.gq', 'SSG'],
  ['AO', 'Angola', 'Africa', 'Luanda', 'evisa', 30, 120, 5, 10, 'https://www.smevisa.gov.ao', 'LAD'],
  ['ZM', 'Zambia', 'Africa', 'Lusaka', 'evisa', 90, 25, 3, 5, 'https://eservices.zambiaimmigration.gov.zm', 'LUN'],
  ['ZW', 'Zimbabwe', 'Africa', 'Harare', 'evisa', 30, 30, 3, 5, 'https://www.evisa.gov.zw', 'HRE VFA', { note: 'KAZA UNIVISA (US$50) covers Zimbabwe + Zambia.' }],
  ['MW', 'Malawi', 'Africa', 'Lilongwe', 'evisa', 30, 50, 3, 5, 'https://www.evisa.gov.mw', 'LLW'],
  ['MZ', 'Mozambique', 'Africa', 'Maputo', 'voa', 30, 50, 0, 0, 'https://www.evisa.gov.mz', 'MPM'],
  ['BW', 'Botswana', 'Africa', 'Gaborone', 'evisa', 90, 50, 5, 10, 'https://www.gov.bw/visas', 'GBE'],
  ['NA', 'Namibia', 'Africa', 'Windhoek', 'voa', 90, 90, 0, 0, 'https://eservices.mhaiss.gov.na', 'WDH', { note: 'Visa on arrival / eVisa introduced April 2025.' }],
  ['LS', 'Lesotho', 'Africa', 'Maseru', 'evisa', 30, 50, 3, 5, 'https://www.evisalesotho.com', 'MSU'],
  ['SZ', 'Eswatini', 'Africa', 'Mbabane', 'sticker_required', 30, 50, 5, 15, 'https://www.gov.sz', 'SHO'],
  ['MG', 'Madagascar', 'Africa', 'Antananarivo', 'voa', 30, 37, 0, 0, 'https://evisamada.gov.mg', 'TNR'],
  ['KM', 'Comoros', 'Africa', 'Moroni', 'voa', 45, 30, 0, 0, 'https://www.gouvernement.km', 'HAH'],
  ['CV', 'Cape Verde', 'Africa', 'Praia', 'voa', 30, 30, 0, 0, 'https://www.ease.gov.cv', 'RAI', { note: 'Pre-register on the EASE portal before arrival.' }],
  ['ST', 'São Tomé and Príncipe', 'Africa', 'São Tomé', 'evisa', 15, 25, 2, 5, 'https://www.smf.st', 'TMS'],
  ['MR', 'Mauritania', 'Africa', 'Nouakchott', 'evisa', 30, 55, 2, 5, 'https://anrpts.gov.mr', 'NKC'],
  ['GW', 'Guinea-Bissau', 'Africa', 'Bissau', 'voa', 90, 85, 0, 0, 'https://www.sef.gw', 'OXB'],

  // ── Oceania
  ['FJ', 'Fiji', 'Oceania', 'Suva', 'visa_free', 120, 0, 0, 0, 'https://www.immigration.gov.fj', 'NAN'],
  ['PG', 'Papua New Guinea', 'Oceania', 'Port Moresby', 'evisa', 60, 50, 10, 20, 'https://evisa.ica.gov.pg', 'POM'],
  ['WS', 'Samoa', 'Oceania', 'Apia', 'visa_free', 60, 0, 0, 0, 'https://www.samoagovt.ws', 'APW'],
  ['TO', 'Tonga', 'Oceania', "Nuku'alofa", 'voa', 31, 0, 0, 0, 'https://www.gov.to', 'TBU'],
  ['VU', 'Vanuatu', 'Oceania', 'Port Vila', 'visa_free', 30, 0, 0, 0, 'https://immigration.gov.vu', 'VLI'],
  ['SB', 'Solomon Islands', 'Oceania', 'Honiara', 'voa', 90, 0, 0, 0, 'https://www.immigration.gov.sb', 'HIR'],
  ['PW', 'Palau', 'Oceania', 'Ngerulmud', 'voa', 30, 50, 0, 0, 'https://www.palaugov.pw', 'ROR'],
  ['FM', 'Micronesia', 'Oceania', 'Palikir', 'visa_free', 30, 0, 0, 0, 'https://gov.fm', 'PNI'],
  ['KI', 'Kiribati', 'Oceania', 'Tarawa', 'sticker_required', 30, 50, 10, 20, 'https://www.mfa.gov.ki', 'TRW'],
  ['MH', 'Marshall Islands', 'Oceania', 'Majuro', 'sticker_required', 30, 50, 10, 20, 'https://rmigov.com', 'MAJ'],
  ['TV', 'Tuvalu', 'Oceania', 'Funafuti', 'voa', 30, 0, 0, 0, 'https://www.gov.tv', 'FUN'],
  ['NR', 'Nauru', 'Oceania', 'Yaren', 'sticker_required', 30, 100, 10, 20, 'https://www.naurugov.nr', 'INU'],
  ['CK', 'Cook Islands', 'Oceania', 'Avarua', 'visa_free', 31, 0, 0, 0, 'https://www.immigration.gov.ck', 'RAR'],
  ['NU', 'Niue', 'Oceania', 'Alofi', 'visa_free', 30, 0, 0, 0, 'https://www.gov.nu', 'IUE'],
];
