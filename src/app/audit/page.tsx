'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ScanEye,
  Globe,
  Search,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';

export default function DigitalAuditPage() {
  const [urlInput, setUrlInput] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditedLeads, setAuditedLeads] = useState<any[]>([]);

  // Pagination for audit directory
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAuditedLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) {
        setAuditedLeads(data.leads.filter((l: any) => l.audit));
      }
    } catch (err) {
      console.error('Fetch audited leads error:', err);
    }
  };

  useEffect(() => {
    fetchAuditedLeads();
  }, []);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setAuditing(true);
    setAuditResult(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.audit);
      }
    } catch (err) {
      console.error('Audit run error:', err);
    } finally {
      setAuditing(false);
    }
  };

  const paginatedAuditedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return auditedLeads.slice(start, start + pageSize);
  }, [auditedLeads, currentPage, pageSize]);

  return (
    <div className="space-y-6  mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ScanEye className="w-5 h-5 text-blue-500" />
          <span>Digital Opportunity Audit Center</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Scan any public business URL or inspect discovered lead websites for conversion friction, missing booking hooks, and SEO gaps.
        </p>
      </div>

      {/* Standalone URL Scanner */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Run Instant Public Web Audit
        </h2>

        <form onSubmit={handleRunAudit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. auradentalcare-demo.in or https://business-website.com"
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={auditing}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {auditing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing Website...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Website Signals</span>
              </>
            )}
          </button>
        </form>

        {/* Live Result Box */}
        {auditResult && (
          <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Classification</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {auditResult.websiteStatus}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Overall Audit Score</span>
                <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {auditResult.overallScore} / 100
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              {auditResult.summaryText}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">HTTPS Security</span>
                <span className={auditResult.isHttps ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500'}>
                  {auditResult.isHttps ? '✓ Yes' : '✕ No'}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Mobile Responsive</span>
                <span className={auditResult.mobileFriendly ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500'}>
                  {auditResult.mobileFriendly ? '✓ Yes' : '✕ No'}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">WhatsApp Chat</span>
                <span className={auditResult.hasWhatsApp ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500'}>
                  {auditResult.hasWhatsApp ? '✓ Found' : '✕ Missing'}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Online Booking</span>
                <span className={auditResult.hasBooking ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500'}>
                  {auditResult.hasBooking ? '✓ Found' : '✕ Missing'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audited Lead Registry */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Discovered Business Audit Directory ({auditedLeads.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Website Status</th>
                <th className="py-3 px-3">WhatsApp</th>
                <th className="py-3 px-3">Booking</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedAuditedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-200">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {lead.business.name}
                    </Link>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block">
                      {lead.business.website || 'No website'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{lead.business.category}</td>
                  <td className="py-3.5 px-3 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${lead.audit?.websiteStatus === 'STRONG'
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : lead.audit?.websiteStatus === 'AVERAGE'
                            ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                            : lead.audit?.websiteStatus === 'NEEDS_IMPROVEMENT'
                              ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                              : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                        }`}
                    >
                      {lead.audit?.websiteStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    {lead.audit?.hasWhatsApp ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Detected</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">✕ None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    {lead.audit?.hasBooking ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Detected</span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">✕ None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                    {lead.audit?.overallScore || 0} / 100
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-xs">
                    {lead.audit?.summaryText}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-[11px] font-semibold transition-colors"
                    >
                      Inspect 360 &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={auditedLeads.length}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setCurrentPage(1);
          }}
          itemName="audited businesses"
        />
      </div>
    </div>
  );
}
