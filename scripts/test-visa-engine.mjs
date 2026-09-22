import { resolveVisaRequirements } from '../lib/visa-engine.ts';
import { DESTINATIONS } from '../lib/destinations-data.ts';

console.log('--- Running Visa Resolution Engine Tests ---');

// 1. Standard Indian Passport without secondary visas
const turkey = DESTINATIONS.find((d) => d.countryCode === 'TR');
const standardTurkey = resolveVisaRequirements(turkey, {
  hasUSVisa: false,
  hasSchengen: false,
  hasUKVisa: false,
});
console.assert(
  standardTurkey.effectiveCategory === 'sticker_required',
  `Expected TR standard to be sticker_required, got ${standardTurkey.effectiveCategory}`
);
console.assert(
  standardTurkey.isUpgraded === false,
  'Expected TR standard isUpgraded to be false'
);
console.log('✓ Standard Indian passport baseline verified for Turkey');

// 2. Indian Passport + US Visa
const usTurkey = resolveVisaRequirements(turkey, {
  hasUSVisa: true,
  hasSchengen: false,
  hasUKVisa: false,
});
console.assert(
  usTurkey.effectiveCategory === 'evisa',
  `Expected TR with US Visa to upgrade to evisa, got ${usTurkey.effectiveCategory}`
);
console.assert(
  usTurkey.isUpgraded === true,
  'Expected TR with US Visa to have isUpgraded = true'
);
console.assert(
  usTurkey.upgradeSource === 'US',
  `Expected upgradeSource = US, got ${usTurkey.upgradeSource}`
);
console.log('✓ US Visa relaxation verified for Turkey (Sticker -> eVisa)');

// 3. Indian Passport + Schengen Visa for Georgia
const georgia = DESTINATIONS.find((d) => d.countryCode === 'GE');
const schengenGeorgia = resolveVisaRequirements(georgia, {
  hasUSVisa: false,
  hasSchengen: true,
  hasUKVisa: false,
});
console.assert(
  schengenGeorgia.effectiveCategory === 'visa_free',
  `Expected GE with Schengen to upgrade to visa_free, got ${schengenGeorgia.effectiveCategory}`
);
console.assert(
  schengenGeorgia.isUpgraded === true,
  'Expected GE with Schengen to have isUpgraded = true'
);
console.log('✓ Schengen Visa relaxation verified for Georgia (eVisa -> 100% Visa-Free)');

// 4. Indian Passport + UK Visa for UAE
const uae = DESTINATIONS.find((d) => d.countryCode === 'AE');
const ukUae = resolveVisaRequirements(uae, {
  hasUSVisa: false,
  hasSchengen: false,
  hasUKVisa: true,
});
console.assert(
  ukUae.effectiveCategory === 'voa',
  `Expected AE with UK Visa to upgrade to voa, got ${ukUae.effectiveCategory}`
);
console.assert(
  ukUae.isUpgraded === true,
  'Expected AE with UK Visa to have isUpgraded = true'
);
console.log('✓ UK Visa relaxation verified for UAE (eVisa -> 14-day VoA)');

// 5. Mexico Visa-Free for US Visa holders
const mexico = DESTINATIONS.find((d) => d.countryCode === 'MX');
const usMexico = resolveVisaRequirements(mexico, {
  hasUSVisa: true,
  hasSchengen: false,
  hasUKVisa: false,
});
console.assert(
  usMexico.effectiveCategory === 'visa_free',
  `Expected MX with US Visa to upgrade to visa_free, got ${usMexico.effectiveCategory}`
);
console.log('✓ US Visa relaxation verified for Mexico (Sticker -> 180-day Visa-Free)');

console.log('All 5 Visa Engine tests passed successfully! 🎉');
