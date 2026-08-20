'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  Download,
  Globe,
  Plus,
  Loader2,
  MapPin,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { LEAD_STATUS_CONFIG, formatCurrency } from '@/lib/utils';
import { LeadScoreBadge } from '@/components/leads/LeadScoreBadge';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';
import { OpportunityBadge } from '@/components/leads/OpportunityBadge';
import { Pagination } from '@/components/ui/Pagination';

export default function LeadsDatabasePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [hasPhone, setHasPhone] = useState('ALL');
  const [hasWebsite, setHasWebsite] = useState('ALL');
  const [budgetPotential, setBudgetPotential] = useState('ALL');
  const [qualificationStatus, setQualificationStatus] = useState('ALL');
  const [minOppScore, setMinOppScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState('opportunityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch leads with query parameters
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'ALL') params.append('status', status);
      if (category !== 'ALL') params.append('category', category);
      if (hasPhone !== 'ALL') params.append('hasPhone', hasPhone);
      if (hasWebsite !== 'ALL') params.append('hasWebsite', hasWebsite);
      if (minOppScore > 0) params.append('minOppScore', minOppScore.toString());
      if (budgetPotential !== 'ALL') params.append('budgetPotential', budgetPotential);
      if (qualificationStatus !== 'ALL') params.append('qualificationStatus', qualificationStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        setCurrentPage(1); // Reset to page 1 on filter changes
      }
    } catch (err) {
      console.error('Fetch leads failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [status, category, hasPhone, hasWebsite, minOppScore, sortBy, sortOrder, budgetPotential, qualificationStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleInlineStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const handleExportExcel = () => {
    window.location.href = '/api/export/excel';
  };

  // Paginated Sliced Data
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return leads.slice(startIndex, startIndex + pageSize);
  }, [leads, currentPage, pageSize]);

  return (
    <div className="space-y-6  mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span>Lead Database & CRM Registry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Filter, prioritize, and manage discovered local businesses with paginated tables and inline lifecycle controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export to Excel</span>
          </button>

          <Link
            href="/finder"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Discover More</span>
          </Link>
        </div>
      </div>

      {/* Filter Control Center */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name, address, area, phone, category..."
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pipeline Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(LEAD_STATUS_CONFIG).map((st) => (
                <option key={st} value={st}>
                  {LEAD_STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Website State Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Website
            </label>
            <select
              value={hasWebsite}
              onChange={(e) => setHasWebsite(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="false">⚠️ No Website</option>
              <option value="true">🌐 Has Website</option>
            </select>
          </div>

          {/* Phone Availability */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Phone
            </label>
            <select
              value={hasPhone}
              onChange={(e) => setHasPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="true">📞 Phone Available</option>
              <option value="false">No Phone</option>
            </select>
          </div>

          {/* Budget Potential Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Est. Budget
            </label>
            <select
              value={budgetPotential}
              onChange={(e) => setBudgetPotential(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Budgets</option>
              <option value="HIGH">💰 High Budget</option>
              <option value="MEDIUM">Standard</option>
              <option value="LOW">Low / Tiny</option>
            </select>
          </div>

          {/* Qualification Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lead Target
            </label>
            <select
              value={qualificationStatus}
              onChange={(e) => setQualificationStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Targets</option>
              <option value="QUALIFIED">✅ Qualified Leads</option>
              <option value="NURTURE">Nurture</option>
              <option value="LOW_PRIORITY">⚠️ Low Priority (Mom/Pop)</option>
            </select>
          </div>

          {/* Opportunity Score Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Min Opportunity
            </label>
            <select
              value={minOppScore}
              onChange={(e) => setMinOppScore(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={0}>Any Score</option>
              <option value={70}>70+ (Strong Opp)</option>
              <option value={80}>80+ (High Priority)</option>
              <option value={90}>90+ (Urgent Need)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="opportunityScore">Opp. Score (High to Low)</option>
              <option value="leadScore">Lead Score</option>
              <option value="distance">Distance</option>
              <option value="createdAt">Date Discovered</option>
              <option value="name">Business Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Total Results: <strong className="text-slate-900 dark:text-white font-bold">{leads.length}</strong> matching prospects
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
            <span>Loading lead database...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No leads found matching your criteria</p>
            <p>Try resetting filters or use the Lead Finder to discover new businesses.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Business Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Distance</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Website</th>
                    <th className="py-3 px-3">Scores</th>
                    <th className="py-3 px-4">Top Opportunity</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Est. Value</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors block"
                        >
                          {lead.business.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs block font-normal">
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
                        {lead.business.website ? (
                          <a
                            href={lead.business.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px] font-medium"
                          >
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">Website</span>
                          </a>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold">No Website</span>
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
                        <select
                          value={lead.status}
                          onChange={(e) => handleInlineStatusChange(lead.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px] rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                        >
                          {Object.keys(LEAD_STATUS_CONFIG).map((st) => (
                            <option key={st} value={st}>
                              {LEAD_STATUS_CONFIG[st].label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        {formatCurrency(lead.estimatedValue || 1500)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.business.name + ' ' + (lead.business.address || ''))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-750 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="Verify location on Google Maps"
                          >
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>Maps</span>
                          </a>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 text-[11px] font-semibold transition-colors whitespace-nowrap"
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

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalItems={leads.length}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="leads"
            />
          </div>
        )}
      </div>
    </div>
  );
}
