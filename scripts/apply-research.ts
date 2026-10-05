/**
 * Apply the desk-research pass (data/seed/research-2026-10.ts) to the JSON
 * dataset. Idempotent. Never sets lastVerifiedAt — research is not a human
 * verification.
 *
 *   npx tsx scripts/apply-research.ts            # dry run: prints changes
 *   npx tsx scripts/apply-research.ts --write    # writes data/*.json
 */
import fs from 'node:fs';
import path from 'node:path';
import type { CountryVisaProfile } from '../types/visa';
import type { TransitHubProfile } from '../types/routes';
import { COUNTRY_RESEARCH, DEFAULT_RESEARCH, HUB_RESEARCH, NOT_CROSS_CHECKED, RESEARCH_DATE } from '../data/seed/research-2026-10';
import { GENERIC_DOCUMENTS, GENERIC_STEPS } from '../lib/visa-content';

const write = process.argv.includes('--write');
const DATA = path.join(__dirname, '..', 'data');
const read = <T>(f: string): T => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf-8'));
const save = (f: string, d: unknown) => fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n');

const countries = read<CountryVisaProfile[]>('destinations.json');
const changes: string[] = [];

for (const c of countries) {
  const r = COUNTRY_RESEARCH[c.countryCode];
  const before = { cat: c.defaultCategory, stay: c.stayDurationDays, fee: c.baseFeeUsd };

  if (r) {
    const categoryChanged = r.patch.defaultCategory && r.patch.defaultCategory !== c.defaultCategory;
    Object.assign(c, r.patch);
    // A category change makes generic steps/documents wrong; refresh them unless the patch supplied its own.
    if (categoryChanged) {
      if (!r.patch.applicationSteps) c.applicationSteps = GENERIC_STEPS[c.defaultCategory];
      if (!r.patch.requiredDocuments && isGeneric(c.requiredDocuments)) c.requiredDocuments = GENERIC_DOCUMENTS[c.defaultCategory];
    }
    c.sourceUrl ??= r.sources[0]?.url;
    c.research = { checkedAt: RESEARCH_DATE, confidence: r.confidence, summary: r.summary, sources: r.sources };
  } else if (NOT_CROSS_CHECKED.has(c.countryCode)) {
    c.research = {
      checkedAt: RESEARCH_DATE,
      confidence: 'low',
      summary: 'Not in the Timatic cross-check (territory/special status) — confirm on the official portal.',
      sources: c.officialPortalUrl ? [{ label: 'Official portal', url: c.officialPortalUrl }] : [],
    };
  } else {
    c.research = { checkedAt: RESEARCH_DATE, ...DEFAULT_RESEARCH };
  }

  const after = { cat: c.defaultCategory, stay: c.stayDurationDays, fee: c.baseFeeUsd };
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    changes.push(`${c.countryCode} ${c.countryName}: ${before.cat}→${after.cat}, stay ${before.stay}→${after.stay}, fee $${before.fee}→$${after.fee}`);
  }
}

function isGeneric(docs: string[]): boolean {
  return Object.values(GENERIC_DOCUMENTS).some((g) => g.length === docs.length && g.every((d, i) => d === docs[i]));
}

const hubs = read<TransitHubProfile[]>('transit-hubs.json');
for (const h of hubs) {
  const r = HUB_RESEARCH[h.code];
  if (!r) continue;
  Object.assign(h, r.patch);
  h.research = { checkedAt: RESEARCH_DATE, confidence: r.confidence, summary: r.summary, sources: r.sources };
  changes.push(`hub ${h.code}: ${r.summary}`);
}

console.log(changes.join('\n'));
console.log(`\n${changes.length} changes; ${countries.filter((c) => c.research).length} countries now carry research notes.`);
if (write) {
  save('destinations.json', countries);
  save('transit-hubs.json', hubs);
  console.log('Written to data/*.json');
} else {
  console.log('Dry run — re-run with --write to save.');
}
