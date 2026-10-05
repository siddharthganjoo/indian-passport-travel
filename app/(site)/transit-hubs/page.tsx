import type { Metadata } from 'next';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { getAllTransitHubs } from '@/lib/db';
import { verificationStatus } from '@/lib/visa-engine';
import { cn } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Transit hubs for Indian passport holders',
  description:
    'Airside transit, self-transfer and transit-visa rules for Indians at Istanbul, Dubai, Doha, Addis Ababa, Singapore, London, Frankfurt and more.',
};

export default async function TransitHubsPage() {
  const hubs = await getAllTransitHubs();

  return (
    <div className="space-y-10">
      <div className="max-w-2xl space-y-3">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">Transit hubs</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          What an Indian passport holder needs when connecting through major airports.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 p-5 text-sm leading-relaxed">
        <div>
          <h2 className="font-medium mb-1">One ticket</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Bags are checked through and you stay airside. Usually no visa — except at airports that require an airport transit
            visa for Indians.
          </p>
        </div>
        <div>
          <h2 className="font-medium mb-1">Separate tickets (self-transfer)</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            With checked bags you must enter the country to collect and re-check them, so you need its entry visa. Cabin-only
            travellers can sometimes stay airside.
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {hubs.map((hub) => {
          const status = verificationStatus(hub.lastVerifiedAt);
          return (
            <li key={hub.code}>
              <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800 open:border-zinc-300 dark:open:border-zinc-700">
                <summary className="flex items-center gap-4 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-2xl leading-none" aria-hidden>{hub.flagEmoji}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium">
                      {hub.city} <span className="text-zinc-400 font-normal">· {hub.code}</span>
                    </span>
                    <span className="block text-sm text-zinc-500 truncate">{hub.airportName}</span>
                  </span>
                  <span className="hidden sm:flex flex-col items-end gap-1 text-xs">
                    <Pill ok={!hub.transitVisaNeededForIndians}>
                      {hub.transitVisaNeededForIndians ? 'Transit visa needed' : 'Airside: no visa'}
                    </Pill>
                    <Pill ok={hub.airsideSelfTransfer}>{hub.airsideSelfTransfer ? 'Airside self-transfer' : 'Self-transfer: enter country'}</Pill>
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>

                <div className="px-4 pb-5 pt-1 space-y-5 text-sm border-t border-zinc-100 dark:border-zinc-800">
                  <div className="sm:hidden flex flex-wrap gap-2 pt-3 text-xs">
                    <Pill ok={!hub.transitVisaNeededForIndians}>
                      {hub.transitVisaNeededForIndians ? 'Transit visa needed' : 'Airside: no visa'}
                    </Pill>
                    <Pill ok={hub.airsideSelfTransfer}>{hub.airsideSelfTransfer ? 'Airside self-transfer' : 'Self-transfer: enter country'}</Pill>
                  </div>
                  <p className="pt-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">{hub.rulesSummary}</p>
                  {!!hub.transitVisaExemptWith?.length && hub.transitVisaNeededForIndians && (
                    <p className="text-emerald-700 dark:text-emerald-400">
                      Transit visa waived if you hold a valid {hub.transitVisaExemptWith.join(', ')} visa.
                    </p>
                  )}
                  {(hub.freeStopoverHotelAvailable || hub.freeTourAvailable) && (
                    <p className="text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium text-zinc-900 dark:text-white">Stopover perks: </span>
                      {[hub.freeStopoverHotelAvailable && 'free hotel', hub.freeTourAvailable && 'free city tour'].filter(Boolean).join(' and ')}
                      {hub.airlineProgramName && ` (${hub.airlineProgramName})`} — conditions apply.
                    </p>
                  )}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {hub.criticalWarnings.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2">Watch out for</h3>
                        <ul className="space-y-2">
                          {hub.criticalWarnings.map((w, i) => (
                            <li key={i} className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                              <span className="mt-2 w-1 h-1 rounded-full bg-zinc-400 shrink-0" aria-hidden />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {hub.stepByStepGuide.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2">At the airport</h3>
                        <ol className="space-y-2 list-decimal pl-4 marker:text-zinc-400 text-zinc-600 dark:text-zinc-400">
                          {hub.stepByStepGuide.map((s, i) => (
                            <li key={i} className="pl-1">{s}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <a
                      href={hub.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600"
                    >
                      Official website <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                    </a>
                    <span className={status === 'verified' ? 'text-zinc-500' : 'text-amber-700 dark:text-amber-400'}>
                      {status === 'verified' ? 'Recently verified' : 'Not recently verified — confirm before travel'}
                    </span>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
      <span className={cn('w-1.5 h-1.5 rounded-full', ok ? 'bg-emerald-500' : 'bg-amber-500')} aria-hidden />
      {children}
    </span>
  );
}
