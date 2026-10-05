'use client';

import * as React from 'react';
import { CountryVisaProfile, BaseVisaCategory } from '@/types/visa';
import { SmartRouteHack, TransitHubProfile } from '@/types/routes';
import { cn, formatInr, getVisaCategoryLabel, visaCategoryDot } from '@/lib/utils';
import { verificationStatus } from '@/lib/visa-engine';
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Plane,
  Building2,
  FileText,
  ShieldCheck,
  Save,
} from 'lucide-react';

const CONTINENTS = ['All', 'Asia', 'Europe', 'Middle East', 'Africa', 'Americas', 'Oceania'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<'countries' | 'routes' | 'hubs' | 'backup'>('countries');
  const [destinations, setDestinations] = React.useState<CountryVisaProfile[]>([]);
  const [routes, setRoutes] = React.useState<SmartRouteHack[]>([]);
  const [hubs, setHubs] = React.useState<TransitHubProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [storage, setStorage] = React.useState<{ kind: string; writable: boolean } | null>(null);

  // Search & Filter state for countries
  const [searchQuery, setSearchQuery] = React.useState('');
  const [continentFilter, setContinentFilter] = React.useState('All');
  const [reviewOnly, setReviewOnly] = React.useState(false);

  // Country Modal State
  const [editingCountry, setEditingCountry] = React.useState<CountryVisaProfile | null>(null);
  const [isCountryModalOpen, setIsCountryModalOpen] = React.useState(false);

  // Route Modal State
  const [editingRoute, setEditingRoute] = React.useState<SmartRouteHack | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = React.useState(false);

  // Load database on mount
  const loadDatabase = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/database');
      if (res.ok) {
        const data = await res.json();
        setDestinations(data.destinations || []);
        setRoutes(data.routes || []);
        setHubs(data.transitHubs || []);
        setStorage(data.storage ?? null);
      }
    } catch (err) {
      console.error('Failed to load database:', err);
      showStatus('Failed to connect to database', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ----------------------------------------------------
  // Country Handlers
  // ----------------------------------------------------
  const handleOpenAddCountry = () => {
    const newCountry: CountryVisaProfile = {
      countryCode: '',
      countryName: '',
      continent: 'Asia',
      defaultCategory: 'evisa',
      processingTimeDays: { min: 2, max: 5 },
      baseFeeUsd: 25,
      baseFeeInr: 2100,
      stayDurationDays: 30,
      conditionalUpgrades: {},
      requiredDocuments: [
        'Passport valid for at least 6 months with 2 blank pages',
        'Confirmed return or onward flight ticket',
        'Proof of lodging reservation',
        'Proof of financial solvency',
      ],
      applicationSteps: [],
      officialPortalUrl: 'https://',
      capitalCity: '',
      popularAirports: [],
      bestTimeToVisit: '',
      tagline: '',
      lastVerifiedAt: null,
    };
    setEditingCountry(newCountry);
    setIsCountryModalOpen(true);
  };

  const handleEditCountry = (country: CountryVisaProfile) => {
    setEditingCountry(JSON.parse(JSON.stringify(country)));
    setIsCountryModalOpen(true);
  };

  const handleSaveCountry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCountry || !editingCountry.countryCode || !editingCountry.countryName) {
      showStatus('Country Code and Name are mandatory', 'error');
      return;
    }
    // "Save & mark verified" stamps today's date in the same save.
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const payload =
      submitter?.value === 'verify' ? { ...editingCountry, lastVerifiedAt: new Date().toISOString() } : editingCountry;

    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showStatus(`Saved country ${editingCountry.countryName} (${editingCountry.countryCode})`, 'success');
        setIsCountryModalOpen(false);
        loadDatabase();
      } else {
        const err = await res.json();
        showStatus(err.error || 'Failed to save country', 'error');
      }
    } catch (err) {
      console.error(err);
      showStatus('Network error saving country', 'error');
    }
  };

  const handleDeleteCountry = async (countryCode: string) => {
    if (!confirm(`Are you sure you want to delete ${countryCode}?`)) return;

    try {
      const res = await fetch(`/api/admin/destinations?countryCode=${countryCode}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showStatus(`Deleted country ${countryCode}`, 'success');
        loadDatabase();
      } else {
        showStatus(`Failed to delete country`, 'error');
      }
    } catch (err) {
      console.error(err);
      showStatus('Error deleting country', 'error');
    }
  };

  const handleVerify = async (type: 'country' | 'hub', code: string) => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, code }),
      });
      const body = await res.json();
      if (!res.ok) return showStatus(body.error || 'Failed to mark verified', 'error');
      showStatus(`${code} marked as verified today`, 'success');
      loadDatabase();
    } catch (err) {
      console.error(err);
      showStatus('Network error', 'error');
    }
  };

  const handleDeleteHub = async (code: string) => {
    if (!confirm(`Delete transit hub ${code}?`)) return;
    const res = await fetch(`/api/admin/hubs?code=${code}`, { method: 'DELETE' });
    const body = await res.json();
    if (!res.ok) return showStatus(body.error || 'Failed to delete hub', 'error');
    showStatus(`Deleted hub ${code}`, 'success');
    loadDatabase();
  };

  // ----------------------------------------------------
  // Route Handlers
  // ----------------------------------------------------
  const handleOpenAddRoute = () => {
    const newRoute: SmartRouteHack = {
      id: `route-${Date.now()}`,
      originIata: 'DEL',
      originCity: 'New Delhi',
      destinationCountryCode: 'BR',
      destinationCountryName: 'Brazil',
      destinationIata: 'GRU',
      destinationCity: 'São Paulo',
      hubIata: 'IST',
      hubCity: 'Istanbul',
      hubCountry: 'Turkey',
      standardDirectFareInr: 115000,
      hackCombinedFareInr: 67000,
      estimatedSavingsInr: 48000,
      savingsPercentage: 42,
      leg1: {
        fromIata: 'DEL',
        fromCity: 'Delhi',
        toIata: 'IST',
        toCity: 'Istanbul',
        airline: 'IndiGo / Turkish Airlines',
        airlineCode: '6E / TK',
        typicalDurationHours: 6.5,
        typicalFareInr: 22000,
        flightFrequency: '3x daily',
      },
      leg2: {
        fromIata: 'IST',
        fromCity: 'Istanbul',
        toIata: 'GRU',
        toCity: 'São Paulo',
        airline: 'Turkish Airlines',
        airlineCode: 'TK',
        typicalDurationHours: 13.0,
        typicalFareInr: 45000,
        flightFrequency: 'Daily',
      },
      transitVisa: {
        status: 'conditional_free',
        badgeLabel: 'Turkey eVisa or Free Airside',
        costInr: 4200,
        costUsd: 50,
        allowedHours: 72,
        description: 'Airside transit is visa-free on through tickets. eVisa available for US/UK/Schengen holders.',
      },
      layover: {
        minRecommendedLayoverHours: 3.5,
        baggageTransfer: 'through_checked',
        baggageAdvice: 'Through-checked luggage on Turkish Airlines.',
        terminalTransferNotes: 'Single modern mega-terminal at IST.',
        recommendedTimingTips: ['Allow 4h+ for self transfers', 'Bring printed US/Schengen visa'],
      },
      bestAirlines: ['Turkish Airlines', 'IndiGo'],
      notes: 'Huge savings compared to single ticket legacy carriers.',
      verifiedDate: '2026-04',
    };
    setEditingRoute(newRoute);
    setIsRouteModalOpen(true);
  };

  const handleEditRoute = (route: SmartRouteHack) => {
    setEditingRoute(JSON.parse(JSON.stringify(route)));
    setIsRouteModalOpen(true);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    // Recalculate savings
    const savings = editingRoute.standardDirectFareInr - editingRoute.hackCombinedFareInr;
    const pct = Math.round((savings / editingRoute.standardDirectFareInr) * 100);
    const payload = {
      ...editingRoute,
      estimatedSavingsInr: savings > 0 ? savings : 0,
      savingsPercentage: pct > 0 ? pct : 0,
    };

    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showStatus('Saved smart route successfully', 'success');
        setIsRouteModalOpen(false);
        loadDatabase();
      } else {
        const err = await res.json().catch(() => ({}));
        showStatus(err.error || 'Failed to save route', 'error');
      }
    } catch (err) {
      console.error(err);
      showStatus('Error saving route', 'error');
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      const res = await fetch(`/api/admin/routes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('Route deleted', 'success');
        loadDatabase();
      }
    } catch (err) {
      console.error(err);
      showStatus('Failed to delete route', 'error');
    }
  };

  // ----------------------------------------------------
  // Backup / Export / Import Handlers
  // ----------------------------------------------------
  const handleDownloadBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      destinations,
      routes,
      transitHubs: hubs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jugo-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/admin/database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });

        if (res.ok) {
          showStatus('Database successfully restored from JSON!', 'success');
          loadDatabase();
        } else {
          const err = await res.json().catch(() => ({}));
          showStatus(err.error || 'Failed to restore database', 'error');
        }
      } catch (err) {
        console.error(err);
        showStatus('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const needsReviewCount = destinations.filter((c) => verificationStatus(c.lastVerifiedAt) !== 'verified').length;

  // Filtered countries
  const filteredCountries = React.useMemo(() => {
    return destinations.filter((c) => {
      if (reviewOnly && verificationStatus(c.lastVerifiedAt) === 'verified') return false;
      if (continentFilter !== 'All' && c.continent !== continentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.countryName.toLowerCase().includes(q) ||
          c.countryCode.toLowerCase().includes(q) ||
          c.capitalCity.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [destinations, continentFilter, searchQuery, reviewOnly]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
              Data admin
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Review and edit visa rules, transit hubs and route ideas. Open a country, check it against its official website, then use “Save &amp; mark verified”.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDatabase()}
            disabled={loading}
            className="p-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          <button
            onClick={handleDownloadBackup}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {storage && !storage.writable && (
        <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          Read-only: this deployment has no database configured, so edits cannot be saved. Set <code>DATABASE_URL</code> (Supabase
          Postgres) and run <code>npx tsx scripts/db-setup.ts</code>.
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('countries')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'countries'
              ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <span>Countries Database</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-100 dark:bg-zinc-800">
            {destinations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'routes'
              ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <span>Smart Route Hacks</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
            {routes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hubs')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'hubs'
              ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <span>Transit Hubs</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-100 dark:bg-zinc-800">
            {hubs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'backup'
              ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <span>Backup & Sync</span>
        </button>
      </div>

      {/* TAB 1: COUNTRIES DATABASE */}
      {activeTab === 'countries' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search countries by name or ISO code (e.g. Brazil, BR)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <select
                value={continentFilter}
                onChange={(e) => setContinentFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
              >
                {CONTINENTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="button"
                aria-pressed={reviewOnly}
                onClick={() => setReviewOnly((v) => !v)}
                className={cn(
                  'text-xs px-3 py-2 rounded-lg border cursor-pointer',
                  reviewOnly
                    ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                )}
              >
                Needs review ({needsReviewCount})
              </button>
            </div>

            <button
              onClick={handleOpenAddCountry}
              className="px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Country</span>
            </button>
          </div>

          {/* Countries Table */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Country Name</th>
                    <th className="p-3">Continent</th>
                    <th className="p-3">Visa Rule</th>
                    <th className="p-3">Stay Days</th>
                    <th className="p-3">Fee (INR)</th>
                    <th className="p-3">Airports</th>
                    <th className="p-3">Verified</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredCountries.map((c) => (
                    <tr key={c.countryCode} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-zinc-950 dark:text-white">
                        {c.countryCode}
                      </td>
                      <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.countryName}
                      </td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-400">
                        {c.continent}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          <span className={cn('w-2 h-2 rounded-full', visaCategoryDot(c.defaultCategory))} aria-hidden />
                          {getVisaCategoryLabel(c.defaultCategory)}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300">
                        {c.stayDurationDays} days
                      </td>
                      <td className="p-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {c.baseFeeInr ? formatInr(c.baseFeeInr) : 'Free'}
                      </td>
                      <td className="p-3 font-mono text-zinc-500">
                        {c.popularAirports.slice(0, 3).join(', ')}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <VerifiedCell value={c.lastVerifiedAt} research={c.research} />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerify('country', c.countryCode)}
                            className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                            title="Mark verified against the official source today"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditCountry(c)}
                            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                            title="Edit Country"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCountry(c.countryCode)}
                            className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Country"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCountries.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500">
                No countries match your search filter. Click &ldquo;Add New Country&rdquo; above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SMART ROUTE HACKS */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                Multi-Leg Stopover Route Hacks
              </h2>
              <p className="text-xs text-zinc-500">
                Routes designed to slash standard long-haul fares (e.g. India to Brazil via Turkey or Ethiopia).
              </p>
            </div>

            <button
              onClick={handleOpenAddRoute}
              className="px-4 py-2 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Route Hack</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {routes.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950 dark:text-white">
                      {r.originCity} ({r.originIata}) ➔ {r.hubCity} ({r.hubIata}) ➔ {r.destinationCity} ({r.destinationIata})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Save {formatInr(r.estimatedSavingsInr)} ({r.savingsPercentage}% off)
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Leg 1: {r.leg1.airline} ({formatInr(r.leg1.typicalFareInr)})</span>
                    <span>•</span>
                    <span>Transit: {r.transitVisa.badgeLabel}</span>
                    <span>•</span>
                    <span>Leg 2: {r.leg2.airline} ({formatInr(r.leg2.typicalFareInr)})</span>
                  </div>

                  <p className="text-xs text-zinc-500 italic max-w-2xl">{r.notes}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-zinc-400 line-through">
                      Legacy: {formatInr(r.standardDirectFareInr)}
                    </div>
                    <div className="text-base font-bold text-zinc-900 dark:text-white">
                      Split: {formatInr(r.hackCombinedFareInr)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditRoute(r)}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    title="Edit Route"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoute(r.id)}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 cursor-pointer"
                    title="Delete Route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSIT HUBS */}
      {activeTab === 'hubs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                Transit Hubs Directory
              </h2>
              <p className="text-xs text-zinc-500">
                Configured international transit airports and their visa policies for Indian passport holders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubs.map((hub) => (
              <div
                key={hub.code}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{hub.flagEmoji}</span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {hub.airportName} ({hub.code})
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      hub.transitVisaNeededForIndians
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {hub.transitVisaType}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {hub.rulesSummary}
                </p>

                <div className="text-xs font-mono text-zinc-500">
                  Airlines: {hub.keyAirlines.join(', ')}
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Self-transfer airside: {hub.airsideSelfTransfer ? 'yes' : 'no'}</span>
                  <span>Transit visa: {hub.transitVisaNeededForIndians ? 'required' : 'not required'}</span>
                  {!!hub.transitVisaExemptWith?.length && <span>Waived with: {hub.transitVisaExemptWith.join(', ')}</span>}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <VerifiedCell value={hub.lastVerifiedAt} research={hub.research} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify('hub', hub.code)}
                      className="px-2 py-1 rounded text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer"
                    >
                      Mark verified
                    </button>
                    <button
                      onClick={() => handleDeleteHub(hub.code)}
                      className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 cursor-pointer"
                      title="Delete hub"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & SYNC */}
      {activeTab === 'backup' && (
        <div className="max-w-2xl space-y-6 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Data Synchronization & Offline Backup
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Download complete copies of all country visa guidelines and flight route databases, or restore previous versions from JSON.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Export Complete Database
              </span>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Exports all {destinations.length} countries, {routes.length} smart route hacks, and {hubs.length} transit hubs to a timestamped JSON file.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 px-3 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold cursor-pointer"
              >
                Download JSON Backup
              </button>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4" /> Import / Restore Database
              </span>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Upload a JSON backup file to instantly overwrite or merge with current records.
              </p>
              <label className="w-full py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center cursor-pointer">
                <span>Select JSON File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* COUNTRY EDIT / ADD MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isCountryModalOpen && editingCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                {editingCountry.countryCode ? `Edit ${editingCountry.countryName}` : 'Add New Destination'}
              </h3>
              <button
                onClick={() => setIsCountryModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCountry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Country Code (ISO 2-letter)*
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={editingCountry.countryCode}
                    onChange={(e) =>
                      setEditingCountry({ ...editingCountry, countryCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. BR"
                    className="w-full uppercase font-mono p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Country Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCountry.countryName}
                    onChange={(e) =>
                      setEditingCountry({ ...editingCountry, countryName: e.target.value })
                    }
                    placeholder="e.g. Brazil"
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Continent
                  </label>
                  <select
                    value={editingCountry.continent}
                    onChange={(e) =>
                      setEditingCountry({ ...editingCountry, continent: e.target.value as any })
                    }
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  >
                    {CONTINENTS.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Visa Category for Indian Passports
                  </label>
                  <select
                    value={editingCountry.defaultCategory}
                    onChange={(e) =>
                      setEditingCountry({ ...editingCountry, defaultCategory: e.target.value as BaseVisaCategory })
                    }
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  >
                    <option value="visa_free">Visa-Free</option>
                    <option value="voa">Visa on Arrival (VoA)</option>
                    <option value="evisa">Electronic Visa (eVisa)</option>
                    <option value="sticker_required">Sticker Required (Embassy)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Allowed Stay (Days)
                  </label>
                  <input
                    type="number"
                    value={editingCountry.stayDurationDays}
                    onChange={(e) =>
                      setEditingCountry({ ...editingCountry, stayDurationDays: parseInt(e.target.value) || 30 })
                    }
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Visa fee (USD) / (INR)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={editingCountry.baseFeeUsd}
                      onChange={(e) => setEditingCountry({ ...editingCountry, baseFeeUsd: Number(e.target.value) || 0 })}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                      aria-label="Fee in USD"
                    />
                    <input
                      type="number"
                      min={0}
                      value={editingCountry.baseFeeInr}
                      onChange={(e) => setEditingCountry({ ...editingCountry, baseFeeInr: Number(e.target.value) || 0 })}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                      aria-label="Fee in INR"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Processing days (min – max)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={editingCountry.processingTimeDays.min}
                      onChange={(e) =>
                        setEditingCountry({
                          ...editingCountry,
                          processingTimeDays: { ...editingCountry.processingTimeDays, min: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                      aria-label="Minimum processing days"
                    />
                    <input
                      type="number"
                      min={0}
                      value={editingCountry.processingTimeDays.max}
                      onChange={(e) =>
                        setEditingCountry({
                          ...editingCountry,
                          processingTimeDays: { ...editingCountry.processingTimeDays, max: Number(e.target.value) || 0 },
                        })
                      }
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                      aria-label="Maximum processing days"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Capital City
                  </label>
                  <input
                    type="text"
                    value={editingCountry.capitalCity}
                    onChange={(e) =>
                      setEditingCountry({ ...editingCountry, capitalCity: e.target.value })
                    }
                    placeholder="e.g. Brasília"
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Popular Airports (comma-separated IATA)
                  </label>
                  <input
                    type="text"
                    value={editingCountry.popularAirports.join(', ')}
                    onChange={(e) =>
                      setEditingCountry({
                        ...editingCountry,
                        popularAirports: e.target.value.split(',').map((s) => s.trim().toUpperCase()),
                      })
                    }
                    placeholder="e.g. GRU, GIG"
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Official Visa Portal URL
                </label>
                <input
                  type="url"
                  value={editingCountry.officialPortalUrl}
                  onChange={(e) =>
                    setEditingCountry({ ...editingCountry, officialPortalUrl: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tagline / Travel Summary
                </label>
                <input
                  type="text"
                  value={editingCountry.tagline}
                  onChange={(e) =>
                    setEditingCountry({ ...editingCountry, tagline: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  How to apply (one step per line)
                </label>
                <textarea
                  rows={4}
                  value={(editingCountry.applicationSteps ?? []).join('\n')}
                  onChange={(e) =>
                    setEditingCountry({
                      ...editingCountry,
                      applicationSteps: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-[11px]"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editingCountry.isSchengen}
                  onChange={(e) => setEditingCountry({ ...editingCountry, isSchengen: e.target.checked })}
                />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Schengen member (a valid Schengen visa grants entry)</span>
              </label>

              <WaiverEditor
                value={editingCountry.conditionalUpgrades ?? {}}
                onChange={(conditionalUpgrades) => setEditingCountry({ ...editingCountry, conditionalUpgrades })}
              />

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Source checked (URL of the official page you verified against)
                </label>
                <input
                  type="url"
                  value={editingCountry.sourceUrl ?? ''}
                  onChange={(e) => setEditingCountry({ ...editingCountry, sourceUrl: e.target.value || undefined })}
                  placeholder="https://"
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              {/* Required Documents List */}
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Required Documents (one per line)
                </label>
                <textarea
                  rows={4}
                  value={editingCountry.requiredDocuments.join('\n')}
                  onChange={(e) =>
                    setEditingCountry({
                      ...editingCountry,
                      requiredDocuments: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCountryModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  value="save"
                  className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  type="submit"
                  value="verify"
                  className="px-5 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold cursor-pointer flex items-center gap-1.5"
                  title="Save and record that you checked this against the official source today"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save &amp; mark verified</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ROUTE EDIT / ADD MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isRouteModalOpen && editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Edit Smart Stopover Route Hack
              </h3>
              <button
                onClick={() => setIsRouteModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Origin IATA
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoute.originIata}
                    onChange={(e) => setEditingRoute({ ...editingRoute, originIata: e.target.value.toUpperCase() })}
                    className="w-full uppercase font-mono p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Hub IATA (Transit)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoute.hubIata}
                    onChange={(e) => setEditingRoute({ ...editingRoute, hubIata: e.target.value.toUpperCase() })}
                    className="w-full uppercase font-mono p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Destination IATA
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoute.destinationIata}
                    onChange={(e) => setEditingRoute({ ...editingRoute, destinationIata: e.target.value.toUpperCase() })}
                    className="w-full uppercase font-mono p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Destination Country Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoute.destinationCountryCode}
                    onChange={(e) => setEditingRoute({ ...editingRoute, destinationCountryCode: e.target.value.toUpperCase() })}
                    className="w-full uppercase font-mono p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Destination Country Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoute.destinationCountryName}
                    onChange={(e) => setEditingRoute({ ...editingRoute, destinationCountryName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Standard Legacy Fare (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingRoute.standardDirectFareInr}
                    onChange={(e) => setEditingRoute({ ...editingRoute, standardDirectFareInr: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Smart Split Fare (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingRoute.hackCombinedFareInr}
                    onChange={(e) => setEditingRoute({ ...editingRoute, hackCombinedFareInr: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Transit Visa Status Badge
                </label>
                <input
                  type="text"
                  value={editingRoute.transitVisa.badgeLabel}
                  onChange={(e) =>
                    setEditingRoute({
                      ...editingRoute,
                      transitVisa: { ...editingRoute.transitVisa, badgeLabel: e.target.value },
                    })
                  }
                  placeholder="e.g. Turkey eVisa / Free Airside"
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Transit Visa Description
                </label>
                <textarea
                  rows={2}
                  value={editingRoute.transitVisa.description}
                  onChange={(e) =>
                    setEditingRoute({
                      ...editingRoute,
                      transitVisa: { ...editingRoute.transitVisa, description: e.target.value },
                    })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Baggage & Layover Advice
                </label>
                <textarea
                  rows={2}
                  value={editingRoute.layover.baggageAdvice}
                  onChange={(e) =>
                    setEditingRoute({
                      ...editingRoute,
                      layover: { ...editingRoute.layover, baggageAdvice: e.target.value },
                    })
                  }
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Route Hack</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


function VerifiedCell({ value, research }: { value?: string | null; research?: { checkedAt: string; confidence: string } }) {
  const status = verificationStatus(value);
  if (status === 'unverified')
    return (
      <span className="text-xs text-amber-700 dark:text-amber-400" title={research ? `Desk research ${research.checkedAt} (${research.confidence} confidence)` : undefined}>
        {research ? `Researched · ${research.confidence}` : 'Never'}
      </span>
    );
  const date = new Date(value!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return <span className={cn('text-xs', status === 'stale' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400')}>{date}</span>;
}

const WAIVER_ROWS: [string, 'validUSVisaHolder' | 'validSchengenHolder' | 'validUKVisaHolder'][] = [
  ['US visa holders', 'validUSVisaHolder'],
  ['Schengen visa holders', 'validSchengenHolder'],
  ['UK visa holders', 'validUKVisaHolder'],
];

/** Edit the easier-entry rules for travellers who already hold a US, Schengen or UK visa. */
function WaiverEditor({
  value,
  onChange,
}: {
  value: CountryVisaProfile['conditionalUpgrades'];
  onChange: (v: CountryVisaProfile['conditionalUpgrades']) => void;
}) {
  const input = 'w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950';
  return (
    <fieldset className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
      <legend className="px-1 font-medium text-zinc-700 dark:text-zinc-300">Easier entry for holders of other visas</legend>
      {WAIVER_ROWS.map(([label, key]) => {
        const rule = value[key];
        const set = (patch: Partial<NonNullable<typeof rule>>) =>
          onChange({
            ...value,
            [key]: { eligibleCategory: 'evisa', allowedStayDays: 30, conditionNotes: '', ...rule, ...patch },
          });
        return (
          <div key={key} className="grid gap-2 sm:grid-cols-[9rem_10rem_5rem_5rem_1fr] sm:items-center">
            <span className="font-medium">{label}</span>
            <select
              aria-label={`${label}: entry type`}
              value={rule?.eligibleCategory ?? ''}
              onChange={(e) => {
                if (!e.target.value) {
                  const next = { ...value };
                  delete next[key];
                  onChange(next);
                } else set({ eligibleCategory: e.target.value as 'visa_free' | 'evisa' | 'voa' });
              }}
              className={input}
            >
              <option value="">No waiver</option>
              <option value="visa_free">Visa-free</option>
              <option value="voa">Visa on arrival</option>
              <option value="evisa">eVisa</option>
            </select>
            {rule && (
              <>
                <input
                  type="number"
                  min={0}
                  aria-label={`${label}: stay days`}
                  title="Stay (days)"
                  value={rule.allowedStayDays}
                  onChange={(e) => set({ allowedStayDays: Number(e.target.value) || 0 })}
                  className={input}
                />
                <input
                  type="number"
                  min={0}
                  aria-label={`${label}: fee in USD`}
                  title="Fee (USD)"
                  value={rule.specialFeeUsd ?? ''}
                  onChange={(e) => set({ specialFeeUsd: e.target.value === '' ? undefined : Number(e.target.value) })}
                  className={input}
                />
                <input
                  aria-label={`${label}: conditions`}
                  placeholder="Conditions (e.g. visa must be multiple-entry and used once)"
                  value={rule.conditionNotes}
                  onChange={(e) => set({ conditionNotes: e.target.value })}
                  className={input}
                />
              </>
            )}
          </div>
        );
      })}
      <p className="text-[11px] text-zinc-500">Columns: entry type · stay (days) · fee (USD, blank = standard fee) · conditions.</p>
    </fieldset>
  );
}
