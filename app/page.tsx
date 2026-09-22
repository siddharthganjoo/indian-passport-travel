'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DESTINATIONS } from '@/lib/destinations-data';
import { resolveVisaRequirements } from '@/lib/visa-engine';
import { UserVisaProfile, BaseVisaCategory } from '@/types/visa';
import { DestinationCard } from '@/components/kokonut/destination-card';
import { VisaTogglePills } from '@/components/kokonut/visa-toggle-pill';
import { FloatingSearch } from '@/components/kokonut/floating-search';
import { Compass, Globe, Sparkles, ArrowDown } from 'lucide-react';

const CONTINENTS = ['All', 'Asia', 'Europe', 'Middle East', 'Africa', 'Americas'];

const VISA_TABS: { id: 'all' | BaseVisaCategory; label: string }[] = [
  { id: 'all', label: 'All Destinations' },
  { id: 'visa_free', label: 'Visa-Free' },
  { id: 'voa', label: 'Visa on Arrival' },
  { id: 'evisa', label: 'eVisa' },
  { id: 'sticker_required', label: 'Sticker Required' },
];

export default function HomePage() {
  const [userProfile, setUserProfile] = React.useState<UserVisaProfile>({
    hasUSVisa: false,
    hasSchengen: false,
    hasUKVisa: false,
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedContinent, setSelectedContinent] = React.useState('All');
  const [activeTab, setActiveTab] = React.useState<'all' | BaseVisaCategory>('all');

  // Resolve visa rules for all countries dynamically
  const resolvedList = React.useMemo(() => {
    return DESTINATIONS.map((country) => ({
      country,
      resolvedVisa: resolveVisaRequirements(country, userProfile),
    }));
  }, [userProfile]);

  // Count countries upgraded via conditional waivers
  const upgradedCount = React.useMemo(() => {
    return resolvedList.filter((item) => item.resolvedVisa.isUpgraded).length;
  }, [resolvedList]);

  // Filter based on search, continent, and category tab
  const filteredList = React.useMemo(() => {
    return resolvedList.filter((item) => {
      // 1. Tab filter
      if (activeTab !== 'all' && item.resolvedVisa.effectiveCategory !== activeTab) {
        return false;
      }

      // 2. Continent filter
      if (selectedContinent !== 'All' && item.country.continent !== selectedContinent) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.country.countryName.toLowerCase().includes(query);
        const matchesCapital = item.country.capitalCity.toLowerCase().includes(query);
        const matchesContinent = item.country.continent.toLowerCase().includes(query);
        const matchesTagline = item.country.tagline.toLowerCase().includes(query);
        const matchesAirports = item.country.popularAirports.some((a) =>
          a.toLowerCase().includes(query)
        );
        return matchesName || matchesCapital || matchesContinent || matchesTagline || matchesAirports;
      }

      return true;
    });
  }, [resolvedList, activeTab, selectedContinent, searchQuery]);

  const scrollToBrowse = () => {
    const el = document.getElementById('browse-matrix');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12">
      {/* Editorial Hero Section (Manus.im Inspiration) */}
      <section className="relative pt-6 sm:pt-12 pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200">
            <Globe className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            <span>Republic of India • Passport Mobility Matrix</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
            Where Can Your <br className="hidden sm:inline" />
            Indian Passport Take You?
          </h1>

          <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl">
            A real-time travel metasearch for Indian passport holders. Uncover instant visa-free entries, streamlined eVisas, low flight fares from Indian metropolitan hubs, and conditional waivers unlocked by your US, Schengen, or UK visas.
          </p>

          {/* Primary View CTA (Production Standard 20) */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={scrollToBrowse}
              className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold tracking-wide inline-flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Explore Destinations by Visa Status</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Updated for 2026 Sovereign Regulations
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Controls & Filters */}
      <section id="browse-matrix" className="space-y-6 scroll-mt-24">
        {/* Kokonut UI Visa Toggle Pills */}
        <VisaTogglePills
          hasUSVisa={userProfile.hasUSVisa}
          hasSchengen={userProfile.hasSchengen}
          hasUKVisa={userProfile.hasUKVisa}
          onToggleUS={() =>
            setUserProfile((prev) => ({ ...prev, hasUSVisa: !prev.hasUSVisa }))
          }
          onToggleSchengen={() =>
            setUserProfile((prev) => ({ ...prev, hasSchengen: !prev.hasSchengen }))
          }
          onToggleUK={() =>
            setUserProfile((prev) => ({ ...prev, hasUKVisa: !prev.hasUKVisa }))
          }
          upgradedCount={upgradedCount}
        />

        {/* Kokonut Floating Search Bar */}
        <FloatingSearch
          value={searchQuery}
          onChange={setSearchQuery}
          totalResults={filteredList.length}
          selectedContinent={selectedContinent}
          onSelectContinent={setSelectedContinent}
          continents={CONTINENTS}
        />

        {/* Category Tabs with Motion layoutId="activeTab" */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-px">
            {VISA_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count =
                tab.id === 'all'
                  ? resolvedList.length
                  : resolvedList.filter((i) => i.resolvedVisa.effectiveCategory === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-zinc-950 dark:text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {count}
                    </span>
                  </span>

                  {/* Motion active tab underline */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white z-10"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Destination Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredList.map((item) => (
              <DestinationCard
                key={item.country.countryCode}
                country={item.country}
                resolvedVisa={item.resolvedVisa}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredList.length === 0 && (
          <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
            <Compass className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              No matching destinations found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Try modifying your search keywords or resetting your continent and category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedContinent('All');
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
