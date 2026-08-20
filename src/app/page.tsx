import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Compass,
  CalendarClock,
  Sparkles,
  Flame,
  Globe,
  GlobeLock,
  MessageSquare,
  Calendar,
  Layers,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LeadScoreBadge } from '@/components/leads/LeadScoreBadge';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { OpportunityBadge } from '@/components/leads/OpportunityBadge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch Leads & Audits
  const leads = await prisma.lead.findMany({
    include: {
      business: true,
      audit: true,
      opportunities: {
        take: 2,
        orderBy: { confidenceScore: 'desc' },
      },
      followUps: {
        where: { status: 'PENDING' },
        orderBy: { dueDate: 'asc' },
      },
    },
    orderBy: { opportunityScore: 'desc' },
  });

  const totalLeads = leads.length;

  // Pipeline Counts
  const newLeads = leads.filter((l) => l.status === 'NEW').length;
  const contactedLeads = leads.filter((l) =>
    ['CONTACTED', 'WHATSAPP_SENT', 'CALLED'].includes(l.status)
  ).length;
  const interestedLeads = leads.filter((l) => l.status === 'INTERESTED').length;
  const qualifiedLeads = leads.filter((l) => l.qualificationStatus === 'QUALIFIED').length;
  const proposalSentLeads = leads.filter((l) => l.status === 'PROPOSAL_SENT').length;
  const wonLeads = leads.filter((l) => l.status === 'WON').length;

  // Opportunities Stats
  const noWebsiteCount = leads.filter((l) => !l.business.website || l.audit?.websiteStatus === 'NO_WEBSITE').length;
  const needsImprovementWebCount = leads.filter((l) => l.audit?.websiteStatus === 'NEEDS_IMPROVEMENT').length;
  const noBookingCount = leads.filter((l) => !l.audit?.hasBooking && ['Health', 'Beauty', 'Fitness'].includes(l.business.category)).length;
  const noOrderingCount = leads.filter((l) => !l.audit?.hasOnlineOrdering && ['Restaurants', 'Cafes', 'Food'].includes(l.business.category)).length;
  const noWhatsAppCount = leads.filter((l) => !l.audit?.hasWhatsApp).length;
  const highValueOppCount = leads.filter((l) => l.opportunityScore >= 85).length;

  // Sales Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const followUpsDueToday = leads.filter((l) =>
    l.followUps.some((f) => {
      const d = new Date(f.dueDate);
      return d >= today && d < tomorrow;
    })
  ).length;

  const followUpsOverdue = leads.filter((l) =>
    l.followUps.some((f) => {
      const d = new Date(f.dueDate);
      return d < today;
    })
  ).length;

  const pipelineValue = leads
    .filter((l) => !['WON', 'LOST', 'DO_NOT_CONTACT'].includes(l.status))
    .reduce((sum, l) => sum + (l.estimatedValue || 1500), 0);

  const wonRevenue = leads
    .filter((l) => l.status === 'WON')
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  // Quality Stats
  const avgLeadScore = totalLeads
    ? Math.round(leads.reduce((sum, l) => sum + l.leadScore, 0) / totalLeads)
    : 0;
  const avgOppScore = totalLeads
    ? Math.round(leads.reduce((sum, l) => sum + l.opportunityScore, 0) / totalLeads)
    : 0;
  const withPhoneCount = leads.filter((l) => Boolean(l.business.phone)).length;
  const withWebsiteCount = leads.filter((l) => Boolean(l.business.website)).length;
  const withEmailCount = leads.filter((l) => Boolean(l.business.email)).length;
  const withWhatsAppFound = leads.filter((l) => Boolean(l.audit?.hasWhatsApp)).length;

  // Today's High Priority Action Leads
  const todayActionLeads = leads
    .filter((l) => l.opportunityScore >= 80 || l.status === 'NEW' || l.followUps.length > 0)
    .slice(0, 6);

  return (
    <div className="space-y-8  mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-950/20 dark:from-blue-900/40 dark:via-indigo-900/30 dark:to-slate-900/60 rounded-2xl p-6 md:p-8 border border-blue-200 dark:border-blue-500/20 backdrop-blur-sm relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                Daily Sales Command
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Territory: HSR Layout & Bangalore Metro
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Turn Local Businesses into High-Paying Software Clients
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Discover nearby businesses with missing websites, manual WhatsApp overhead, or no booking systems.
              Qualify, pitch, and convert them systematically.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/finder"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Lead Finder</span>
            </Link>
            <Link
              href="/outreach"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-sm transition-all"
            >
              <Send className="w-4 h-4 text-slate-400" />
              <span>Open Outreach Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 1: Today's Action Queue */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today&apos;s Sales Actions</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Prioritized workflow for immediate outreach</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/outreach"
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-semibold hover:bg-blue-100 dark:hover:bg-blue-600/30 transition-colors"
            >
              Start Calling Now &rarr;
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Follow-ups Due Today</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-amber-500">{followUpsDueToday}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400/80 font-semibold">Pending</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Overdue Follow-ups</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-rose-500">{followUpsOverdue}</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400/80 font-semibold">Urgent</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">New Uncontacted Leads</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{newLeads}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400/80 font-semibold">Fresh</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Proposals Pending</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{proposalSentLeads}</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400/80 font-semibold">Awaiting Reply</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">High-Value Opportunities</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{highValueOppCount}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-semibold">Opp 85+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pipeline & Sales Stats */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Sales Pipeline
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(pipelineValue)} Est.
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Total Leads Discovered</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalLeads}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Contacted / In Discussion</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">{contactedLeads}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Interested & Qualified</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{interestedLeads + qualifiedLeads}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Proposals Sent</span>
                <span className="font-semibold text-pink-600 dark:text-pink-400">{proposalSentLeads}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Closed Won Revenue</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(wonRevenue)} ({wonLeads} deals)</span>
              </div>
            </div>
          </div>
          <Link
            href="/pipeline"
            className="w-full text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            View Visual Kanban Pipeline &rarr;
          </Link>
        </div>

        {/* Opportunity Breakdown */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Opportunity Breakdown
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{highValueOppCount} High Tier</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <GlobeLock className="w-3.5 h-3.5 text-rose-500" />
                  <span>No Website (Prime Candidates)</span>
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{noWebsiteCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span>Weak / Outdated Websites</span>
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{needsImprovementWebCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span>Missing Online Booking</span>
                </span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{noBookingCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Missing WhatsApp Workflows</span>
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{noWhatsAppCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>Direct Ordering / Menu Gaps</span>
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{noOrderingCount}</span>
              </div>
            </div>
          </div>
          <Link
            href="/opportunities"
            className="w-full text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Explore All Software Opportunities &rarr;
          </Link>
        </div>

        {/* Lead Quality & Data Health */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Data Quality & Reachability
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{avgLeadScore}/100 Avg Lead</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Average Estimated Opportunity</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{avgOppScore} / 100</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Verified Phone Numbers</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {withPhoneCount} ({totalLeads ? Math.round((withPhoneCount / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Existing Websites</span>
                <span className="font-semibold text-slate-900 dark:text-white">{withWebsiteCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Email Addresses Found</span>
                <span className="font-semibold text-slate-900 dark:text-white">{withEmailCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="text-slate-500 dark:text-slate-400">WhatsApp Hooks Detected</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{withWhatsAppFound}</span>
              </div>
            </div>
          </div>
          <Link
            href="/leads"
            className="w-full text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Open Complete Lead Database &rarr;
          </Link>
        </div>
      </div>

      {/* Section 3: High Priority Leads Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Highest Opportunity Prospects Near You</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked by Estimated Software Opportunity Score (Missing web presence, appointment booking, or CRM gaps)
            </p>
          </div>
          <Link
            href="/leads"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View all {totalLeads} leads</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Scores</th>
                <th className="py-3 px-4">Top Opportunity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {todayActionLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors group">
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors block"
                    >
                      {lead.business.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs block">
                      {lead.business.address || lead.business.area || 'Bangalore'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                      {lead.business.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                    {lead.business.distanceKm !== null ? `${lead.business.distanceKm} km` : '—'}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    {lead.business.phone ? (
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{lead.business.phone}</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 italic">No phone</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <OpportunityScoreBadge score={lead.opportunityScore} />
                      <LeadScoreBadge score={lead.leadScore} />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {lead.opportunities.length > 0 ? (
                      <OpportunityBadge
                        type={lead.opportunities[0].type}
                        title={lead.opportunities[0].title}
                      />
                    ) : (
                      <span className="text-slate-400 text-[11px]">Software Opportunity</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Lead 360 &rarr;
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
