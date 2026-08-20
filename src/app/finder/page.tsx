'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Sliders,
  Sparkles,
  Layers,
  Search,
  Loader2,
  Table as TableIcon,
  Map as MapIcon,
  CheckCircle2,
  Phone,
  Globe,
  ExternalLink,
  Flame,
  AlertCircle,
  LocateFixed,
} from 'lucide-react';
import { CATEGORIES, CATEGORY_GROUPS, SEARCH_PRESETS } from '@/lib/categories';
import { LeadScoreBadge } from '@/components/leads/LeadScoreBadge';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { Pagination } from '@/components/ui/Pagination';

// Dynamically import Leaflet map to prevent SSR issues
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 text-xs">
      <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
      Loading OpenStreetMap Interactive Map...
    </div>
  ),
});

export default function LeadFinderPage() {
  const [address, setAddress] = useState('HSR Layout, Bangalore');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([
    'restaurants',
    'cafes',
    'clinics',
    'salons',
  ]);
  const [activeGroup, setActiveGroup] = useState<string>('All');
  const [activePreset, setActivePreset] = useState<string>('local_business_prospects');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState<any>(null);
  const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  // Pagination for table view
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load existing leads initially from database for HSR Layout
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success && data.leads.length > 0) {
          const mapped = data.leads.map((l: any) => ({
            id: l.id,
            leadId: l.id,
            osmId: l.business.osmId,
            name: l.business.name,
            category: l.business.category,
            address: l.business.address,
            area: l.business.area,
            latitude: l.business.latitude,
            longitude: l.business.longitude,
            distanceKm: l.business.distanceKm,
            phone: l.business.phone,
            website: l.business.website,
            status: l.status,
            leadScore: l.leadScore,
            opportunityScore: l.opportunityScore,
          }));
          setDiscoveredLeads(mapped);
          setSearchSummary({
            center: { address: 'HSR Layout, Bangalore', latitude: 12.9121, longitude: 77.6446, radiusKm: 5 },
            totalFound: mapped.length,
            withPhone: mapped.filter((m: any) => Boolean(m.phone)).length,
            withWebsite: mapped.filter((m: any) => Boolean(m.website)).length,
            highOpportunity: mapped.filter((m: any) => m.opportunityScore >= 80).length,
          });
        }
      } catch (err) {
        console.error('Initial load error:', err);
      }
    }
    loadInitial();
  }, []);

  const handleApplyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = SEARCH_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedCategoryIds(preset.categoryIds);
    }
  };

  const handleToggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAddress(`Current Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          alert('Unable to retrieve your location. Please type an address.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleFindBusinesses = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          radiusKm,
          categoryIds: selectedCategoryIds,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to discover businesses');
      }

      setDiscoveredLeads(data.leads);
      setCurrentPage(1);
      setSearchSummary({
        center: data.center,
        totalFound: data.totalFound,
        withPhone: data.leads.filter((l: any) => Boolean(l.phone)).length,
        withWebsite: data.leads.filter((l: any) => Boolean(l.website)).length,
        highOpportunity: data.leads.filter((l: any) => l.opportunityScore >= 80).length,
        source: data.source,
        warning: data.warning,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during discovery');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories =
    activeGroup === 'All'
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.group === activeGroup);

  // Paginated leads for Table view
  const paginatedDiscoveredLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return discoveredLeads.slice(start, start + pageSize);
  }, [discoveredLeads, currentPage, pageSize]);

  return (
    <div className="space-y-6  mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-500" />
            <span>Local Business Lead Finder</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Query OpenStreetMap & Overpass for real local businesses, compute distance, detect software needs, and save to SQLite CRM.
          </p>
        </div>

        {searchSummary && (
          <div className="flex items-center gap-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl text-xs shadow-sm">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View ({discoveredLeads.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Search Builder Box */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <form onSubmit={handleFindBusinesses} className="space-y-6">
          {/* Location & Radius Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Search Location / Starting Address</span>
                </span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>Use Current Location</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. HSR Layout, Bangalore or Koramangala, Bangalore"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-500" />
                  <span>Radius: {radiusKm} KM</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  ({radiusKm * 1000} metres)
                </span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 KM</span>
                  <span>5 KM (Recommended)</span>
                  <span>15 KM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Presets Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Targeting Presets</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SEARCH_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isSelected
                        ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Select Categories ({selectedCategoryIds.length} chosen)</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveGroup('All')}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activeGroup === 'All'
                      ? 'bg-slate-800 dark:bg-slate-700 text-white font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  All
                </button>
                {CATEGORY_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setActiveGroup(g)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${activeGroup === g
                        ? 'bg-slate-800 dark:bg-slate-700 text-white font-semibold'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
              {filteredCategories.map((cat) => {
                const isChecked = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${isChecked
                        ? 'bg-blue-50 dark:bg-blue-600/30 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span>{cat.name}</span>
                    {isChecked && <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              ⚡ Sourced directly from OpenStreetMap & Overpass QL without scraping restrictions.
            </div>

            <button
              type="submit"
              disabled={loading || selectedCategoryIds.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Discovering Businesses...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find Businesses Around Me</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Search Result Summary Cards */}
      {searchSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Businesses Discovered</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{searchSummary.totalFound}</div>
          </div>
          <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Phone Numbers Ready</span>
            <div className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{searchSummary.withPhone}</div>
          </div>
          <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Websites Listed</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{searchSummary.withWebsite}</div>
          </div>
          <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">High Software Opportunities</span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {searchSummary.highOpportunity}
            </div>
          </div>
        </div>
      )}

      {/* Map or Table Presentation */}
      {viewMode === 'map' && searchSummary?.center && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
            <span>
              Centred at <strong className="text-slate-900 dark:text-white">{searchSummary.center.address}</strong> (Radius: {searchSummary.center.radiusKm} km)
            </span>
            <span>Click any marker to inspect business opportunities</span>
          </div>
          <LeafletMap
            centerLat={searchSummary.center.latitude}
            centerLon={searchSummary.center.longitude}
            radiusKm={searchSummary.center.radiusKm}
            businesses={discoveredLeads}
            height="540px"
          />
        </div>
      )}

      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
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
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedDiscoveredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-200">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {lead.name}
                      </Link>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block truncate max-w-xs">
                        {lead.address || lead.area || 'Bangalore'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                        {lead.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                      {lead.distanceKm !== null && lead.distanceKm !== undefined ? `${lead.distanceKm} km` : '—'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      {lead.phone ? (
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{lead.phone}</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic">No phone</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">Visit</span>
                        </a>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 text-[11px] font-medium">No Website</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <OpportunityScoreBadge score={lead.opportunityScore || 50} />
                        <LeadScoreBadge score={lead.leadScore || 50} />
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <LeadStatusBadge status={lead.status || 'NEW'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Lead 360 &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={discoveredLeads.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            itemName="discovered businesses"
          />
        </div>
      )}
    </div>
  );
}
