import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Zap,
  GlobeLock,
  Globe,
  Calendar,
  MessageSquare,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OpportunitiesPage() {
  const leads = await prisma.lead.findMany({
    include: {
      business: true,
      audit: true,
      opportunities: true,
    },
    orderBy: { opportunityScore: 'desc' },
  });

  const noWebsiteLeads = leads.filter(
    (l) => !l.business.website || l.audit?.websiteStatus === 'NO_WEBSITE'
  );
  const redesignLeads = leads.filter(
    (l) => l.audit?.websiteStatus === 'NEEDS_IMPROVEMENT'
  );
  const bookingLeads = leads.filter(
    (l) => !l.audit?.hasBooking && ['Health', 'Beauty', 'Fitness'].includes(l.business.category)
  );
  const whatsappLeads = leads.filter((l) => !l.audit?.hasWhatsApp);

  return (
    <div className="space-y-8  mx-auto pb-12">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Detected Software Opportunities Radar</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Heuristic problem detection matched against real business types. Pitch high-converting software solutions to verified local needs.
        </p>
      </div>

      {/* 4 Major Opportunity Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quadrant 1: No Website */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                  <GlobeLock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Missing Website (Zero Digital Footprint)</h2>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{noWebsiteLeads.length} Businesses</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              These businesses rely purely on walk-ins and word of mouth. Pitch a modern, high-speed mobile website with Google Map SEO to capture local search intent.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {noWebsiteLeads.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <Link
                      href={`/leads/${l.id}`}
                      className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                    >
                      {l.business.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {l.business.category} • {l.business.phone || 'No phone'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <OpportunityScoreBadge score={l.opportunityScore} size="sm" />
                    <Link
                      href={`/leads/${l.id}`}
                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-[11px] font-semibold"
                    >
                      Pitch &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quadrant 2: Booking Engine */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Online Appointment Booking Gaps</h2>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">{bookingLeads.length} Clinics & Salons</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Clinics and salons suffering from manual telephone reception bottlenecks. Pitch self-service 24/7 online slot booking with automated WhatsApp calendar sync.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {bookingLeads.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <Link
                      href={`/leads/${l.id}`}
                      className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                    >
                      {l.business.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {l.business.category} • {l.business.phone || 'No phone'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <OpportunityScoreBadge score={l.opportunityScore} size="sm" />
                    <Link
                      href={`/leads/${l.id}`}
                      className="px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 text-[11px] font-semibold"
                    >
                      Pitch &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quadrant 3: WhatsApp Automation */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Missing WhatsApp Chat Hooks</h2>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{whatsappLeads.length} Businesses</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In Indian and global local markets, WhatsApp is the #1 conversion channel. Pitch 1-click WhatsApp inquiry buttons and automated AI/template auto-responders.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {whatsappLeads.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <Link
                      href={`/leads/${l.id}`}
                      className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                    >
                      {l.business.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {l.business.category} • {l.business.phone || 'No phone'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <OpportunityScoreBadge score={l.opportunityScore} size="sm" />
                    <Link
                      href={`/leads/${l.id}`}
                      className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold"
                    >
                      Pitch &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quadrant 4: Website Redesign */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Outdated Website Redesign Prospects</h2>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{redesignLeads.length} Businesses</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Websites failing mobile viewport checks or lacking modern CTA buttons. Pitch high-converting Next.js / modern redesigns with fast performance.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {redesignLeads.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <Link
                      href={`/leads/${l.id}`}
                      className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                    >
                      {l.business.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {l.business.category} • {l.business.phone || 'No phone'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <OpportunityScoreBadge score={l.opportunityScore} size="sm" />
                    <Link
                      href={`/leads/${l.id}`}
                      className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold"
                    >
                      Pitch &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
