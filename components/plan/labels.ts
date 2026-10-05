import type { BagMode, PlanOption, VisaStop } from '@/types/plan';
import { formatInr, getVisaCategoryLabel } from '@/lib/utils';

export const MODE_LABEL: Record<BagMode, string> = { cabin: 'Cabin bag only', checked: 'With checked bag' };

export function optionTitle(o: PlanOption): string {
  if (o.kind === 'self_transfer' && o.hub) return `Via ${o.hub.city}`;
  const offer = o.legs[0].offer;
  return offer.stops === 0 ? `${offer.carrierName} · non-stop` : `${offer.carrierName} · ${offer.stops} stop${offer.stops > 1 ? 's' : ''}`;
}

export function optionSubtitle(o: PlanOption): string {
  if (o.kind === 'self_transfer') return `2 separate tickets · ${o.legs.map((l) => l.offer.carrierName).join(' + ')}`;
  const offer = o.legs[0].offer;
  return offer.via.length ? `1 ticket via ${offer.via.join(', ')}` : '1 ticket';
}

export function routeCodes(o: PlanOption): string[] {
  const first = o.legs[0].offer;
  const codes = [first.from, ...first.via];
  for (const leg of o.legs.slice(1)) codes.push(leg.offer.from, ...leg.offer.via);
  codes.push(o.legs[o.legs.length - 1].offer.to);
  return codes.filter((c, i) => c !== codes[i - 1]);
}

export function stopSummary(v: VisaStop): string {
  const what = v.requirement === 'airside_ok' ? 'no visa needed' : getVisaCategoryLabel(v.requirement);
  const fee = v.feeInr > 0 ? ` · ${formatInr(v.feeInr)}` : '';
  return `${v.countryName}: ${what}${fee}`;
}

/** Non-blocked first, then cheapest total for the chosen bag mode. */
export function sortForMode(options: PlanOption[], mode: BagMode): PlanOption[] {
  return [...options].sort(
    (a, b) => Number(a.modes[mode].blocked) - Number(b.modes[mode].blocked) || a.modes[mode].total - b.modes[mode].total
  );
}
