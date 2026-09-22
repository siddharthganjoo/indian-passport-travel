import * as React from 'react';
import Link from 'next/link';
import { Compass, ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white uppercase font-mono">
                DesiVisa Metasearch
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              An independent, editorial-grade flight and immigration discovery platform built exclusively for Indian passport holders. We index live visa waivers, conditional US/Schengen/UK relaxations, and multi-city low fare corridors from Indian international hubs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-900 dark:text-zinc-100">
              Legal & Transparency
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Privacy Policy (DPDP & GDPR)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Terms & Conditions (Liability Disclaimer)
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  XML Sitemap
                </a>
              </li>
            </ul>
          </div>

          {/* Hubs */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-900 dark:text-zinc-100">
              Key Departure Hubs
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
              DEL (Delhi) • BOM (Mumbai) • BLR (Bengaluru) • MAA (Chennai) • HYD (Hyderabad) • CCU (Kolkata) • COK (Kochi)
            </p>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-start gap-2 max-w-2xl">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Official Immigration Notice:</strong> Visa policies, bilateral fee waivers, and entry eligibility criteria fluctuate at government discretion. DesiVisa is an independent metasearch discovery tool and is not an immigration or visa processing agency. Always confirm entry conditions directly on official sovereign portals prior to flight booking.
            </p>
          </div>

          <div className="font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
            © {new Date().getFullYear()} DesiVisa. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
