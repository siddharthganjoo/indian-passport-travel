'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CountryVisaProfile, ResolvedVisaRequirements } from '@/types/visa';
import { formatInr, getVisaCategoryBadgeColor, getVisaCategoryLabel } from '@/lib/utils';
import { FareSparkline } from '@/components/charts/fare-sparkline';
import { Clock, Banknote, Calendar, Sparkles, ArrowUpRight } from 'lucide-react';

interface DestinationCardProps {
  country: CountryVisaProfile;
  resolvedVisa: ResolvedVisaRequirements;
}

export function DestinationCard({ country, resolvedVisa }: DestinationCardProps) {
  const badgeStyle = getVisaCategoryBadgeColor(resolvedVisa.effectiveCategory);
  const categoryLabel = getVisaCategoryLabel(resolvedVisa.effectiveCategory);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-zinc-950/40"
    >
      {/* Cover Image & Category Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={country.coverImage}
          alt={`Scenic landscape and iconic travel destinations in ${country.countryName} for Indian passport tourists`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Flag & Country Header */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg leading-none">
                <Image
                  src={`https://flagcdn.com/24x18/${country.countryCode.toLowerCase()}.png`}
                  alt={`National flag of ${country.countryName}`}
                  width={20}
                  height={15}
                  className="rounded-xs inline-block shadow-xs"
                />
              </span>
              <span className="text-xs uppercase tracking-wider font-mono text-zinc-300">
                {country.continent}
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              {country.countryName}
            </h3>
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Effective Visa Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} bg-white/90 dark:bg-zinc-900/90`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
            <span>{categoryLabel}</span>
          </div>

          {/* Conditional Upgrade Callout */}
          {resolvedVisa.isUpgraded && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-600 text-white shadow-md shadow-purple-600/30 backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3" />
              <span>{resolvedVisa.upgradeSource} Visa Upgrade</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Card Content & Facts */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Visa Quick Specifications */}
        <div className="grid grid-cols-3 gap-2 text-xs border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Stay
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {country.stayDurationDays} Days
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Processing
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
              {resolvedVisa.processingTime}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Banknote className="w-3 h-3" /> Visa Fee
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {resolvedVisa.feeInr === 0 ? 'FREE' : formatInr(resolvedVisa.feeInr)}
            </span>
          </div>
        </div>

        {/* Upgrade notes if applicable */}
        {resolvedVisa.notes && (
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-300 text-xs">
            <div className="font-medium flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              Relaxation Terms:
            </div>
            <p className="line-clamp-2 text-[11px] leading-relaxed opacity-90">
              {resolvedVisa.notes}
            </p>
          </div>
        )}

        {/* Flight Fare Section with Sparkline */}
        <div className="mt-auto pt-1 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Starting Flight
            </span>
            <div className="text-lg font-bold text-zinc-950 dark:text-white">
              {formatInr(country.sampleLowFareInr)}
            </div>
          </div>

          {/* Bklit UI Sparkline */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-zinc-400 mb-0.5">12-Mo Trend</span>
            <FareSparkline data={country.fareTrends} width={100} height={30} />
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href={`/destination/${country.countryCode}`}
          className="mt-2 inline-flex items-center justify-between w-full h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold tracking-wide transition-all duration-200"
        >
          <span>View Visa Guide & Flights</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
