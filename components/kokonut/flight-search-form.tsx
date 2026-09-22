'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlaneTakeoff, Calendar, Users, Search } from 'lucide-react';
import { INDIAN_ORIGIN_AIRPORTS } from '@/lib/flight-service';
import { FlightOffer } from '@/types/flight';
import { formatInr, formatDuration } from '@/lib/utils';

const flightSearchSchema = z.object({
  origin: z
    .string()
    .length(3, 'Airport code must be exactly 3 letters')
    .regex(/^[A-Z]{3}$/, 'Must be a valid 3-letter uppercase IATA code'),
  departureDate: z.string().min(1, 'Please select a departure date'),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).max(9),
});

type FlightSearchFormData = z.infer<typeof flightSearchSchema>;

interface FlightSearchFormProps {
  destinationCountryCode: string;
  destinationAirport: string;
  countryName: string;
}

export function FlightSearchForm({
  destinationCountryCode,
  destinationAirport,
  countryName,
}: FlightSearchFormProps) {
  const [results, setResults] = React.useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Default dates
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: 'DEL',
      departureDate: nextMonth,
      passengers: 1,
    },
  });

  const selectedOrigin = watch('origin');

  const onSubmit = async (data: FlightSearchFormData) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `/api/flights?origin=${data.origin}&destinationCountryCode=${destinationCountryCode}&departureDate=${data.departureDate}&passengers=${data.passengers}`
      );
      if (res.ok) {
        const json = await res.json();
        setResults(json.offers || []);
      }
    } catch (err) {
      console.error('Failed to search flights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search on mount
  React.useEffect(() => {
    onSubmit({
      origin: 'DEL',
      departureDate: nextMonth,
      passengers: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationCountryCode]);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <PlaneTakeoff className="w-3.5 h-3.5" />
            Live Flight Aggregator (Amadeus / Duffel)
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mt-1">
            Flights from India to {countryName} ({destinationAirport})
          </h3>
        </div>
      </div>

      {/* Form with Zod validation */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Origin Airport Hub */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Indian Departure Hub
            </label>
            <div className="relative">
              <select
                {...register('origin')}
                className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
              >
                {INDIAN_ORIGIN_AIRPORTS.map((hub) => (
                  <option key={hub.code} value={hub.code}>
                    {hub.code} - {hub.city}
                  </option>
                ))}
              </select>
            </div>
            {errors.origin && (
              <p className="text-[11px] text-red-500 mt-1">{errors.origin.message}</p>
            )}
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Departure Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={today}
                {...register('departureDate')}
                className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
              />
            </div>
            {errors.departureDate && (
              <p className="text-[11px] text-red-500 mt-1">{errors.departureDate.message}</p>
            )}
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Travelers
            </label>
            <div className="relative">
              <select
                {...register('passengers', { valueAsNumber: true })}
                className="w-full h-11 px-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
              >
                <option value={1}>1 Adult (Economy)</option>
                <option value={2}>2 Adults (Economy)</option>
                <option value={3}>3 Adults (Economy)</option>
                <option value={4}>4 Adults (Economy)</option>
              </select>
            </div>
          </div>

          {/* Submit Search */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Searching...' : 'Search Fares'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Flight Results Grid */}
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50"
              />
            ))}
          </div>
        ) : results.length > 0 ? (
          results.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                  {offer.airlineCode}
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                    {offer.airline}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>
                      {offer.origin} → {offer.destination}
                    </span>
                    <span>•</span>
                    <span>{offer.stops === 0 ? 'Direct Non-stop' : '1 Stop'}</span>
                    <span>•</span>
                    <span>{formatDuration(offer.durationMinutes)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-zinc-400 font-mono">Starting From</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-white">
                    {formatInr(offer.priceInr)}
                  </div>
                </div>

                <a
                  href={offer.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold tracking-wide inline-flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Book on Skyscanner</span>
                </a>
              </div>
            </div>
          ))
        ) : hasSearched ? (
          <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No live flights found for this specific date corridor. Try searching nearby dates.
          </div>
        ) : null}
      </div>
    </div>
  );
}
