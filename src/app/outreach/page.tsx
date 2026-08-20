'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Send,
  Phone,
  MessageSquare,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { generateOutreachTemplates } from '@/lib/outreach';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';

export default function OutreachWorkspacePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Queue Pagination State
  const [queuePage, setQueuePage] = useState(1);
  const queuePageSize = 8;

  // Interaction logging
  const [loggingCall, setLoggingCall] = useState(false);

  useEffect(() => {
    async function loadQueue() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success && data.leads.length > 0) {
          setLeads(data.leads);
          setSelectedLeadId(data.leads[0].id);
        }
      } catch (err) {
        console.error('Load queue failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const outreach = activeLead
    ? generateOutreachTemplates({
      developerName: 'Parth',
      agencyName: 'Velocity Software Studio',
      businessName: activeLead.business.name,
      category: activeLead.business.category,
      area: activeLead.business.area,
      city: activeLead.business.city,
      websiteState: activeLead.audit?.websiteStatus || (activeLead.business.website ? 'AVERAGE' : 'NO_WEBSITE'),
      detectedOpportunity:
        activeLead.opportunities?.length > 0
          ? activeLead.opportunities[0].title
          : 'Automated Booking & WhatsApp Pipeline',
      phone: activeLead.business.phone,
      email: activeLead.business.email,
    })
    : null;

  const currentTemplate = outreach ? outreach[selectedTone] || outreach.whatsapp : null;

  const handleCopy = () => {
    if (!currentTemplate) return;
    navigator.clipboard.writeText(currentTemplate.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkContacted = async (newStatus: string = 'CONTACTED') => {
    if (!activeLead) return;
    setLoggingCall(true);
    try {
      await fetch(`/api/leads/${activeLead.id}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedTone === 'whatsapp' ? 'WHATSAPP_SENT' : 'CALLED',
          summary: `Outreach completed via ${selectedTone.toUpperCase()}`,
          details: currentTemplate?.content,
          newStatus,
        }),
      });

      // Update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === activeLead.id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error('Mark contacted failed:', err);
    } finally {
      setLoggingCall(false);
    }
  };

  // Paginated Queue
  const totalQueuePages = Math.max(1, Math.ceil(leads.length / queuePageSize));
  const paginatedQueueLeads = useMemo(() => {
    const start = (queuePage - 1) * queuePageSize;
    return leads.slice(start, start + queuePageSize);
  }, [leads, queuePage]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
        <span>Loading outreach workbench...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6  mx-auto pb-12">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-500" />
          <span>Daily Outreach & Sales Workbench</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Streamline daily calling and personalized WhatsApp outreach. Select any lead to generate hyper-personalized conversation starters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Lead Queue Selector */}
        <div className="md:col-span-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Outreach Queue ({leads.length})
              </h2>
              <span className="text-[11px] text-slate-500">Sorted by Opportunity</span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {paginatedQueueLeads.map((lead) => {
                const isSelected = lead.id === activeLead?.id;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                        ? 'bg-blue-50 dark:bg-blue-600/15 border-blue-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-slate-200 text-xs truncate">
                          {lead.business.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lead.business.category} • {lead.business.area || 'Bangalore'}
                        </div>
                      </div>
                      <OpportunityScoreBadge score={lead.opportunityScore} />
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px]">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {lead.business.phone || 'No phone'}
                      </span>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Queue Pagination */}
          {totalQueuePages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <span>
                Page {queuePage} of {totalQueuePages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                  disabled={queuePage === 1}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setQueuePage((p) => Math.min(totalQueuePages, p + 1))}
                  disabled={queuePage === totalQueuePages}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Message Generator & Action Box */}
        {activeLead && currentTemplate && (
          <div className="md:col-span-7 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            {/* Header info of active lead */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {activeLead.business.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeLead.business.category} • {activeLead.business.address || 'Bangalore'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/leads/${activeLead.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Inspect Lead 360 &rarr;
                </Link>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'whatsapp', label: '💬 WhatsApp' },
                { id: 'call_script', label: '📞 Phone Script' },
                { id: 'professional', label: '✉️ Professional Email' },
                { id: 'friendly', label: '☕ Friendly / Coffee' },
                { id: 'short', label: '⚡ Short & Punchy' },
                { id: 'follow_up', label: '🔄 Day 3 Follow-Up' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedTone === tone.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                    }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>

            {/* Subject if email */}
            {currentTemplate.subject && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 font-medium">Subject:</span>{' '}
                <span className="text-slate-900 dark:text-white font-semibold">{currentTemplate.subject}</span>
              </div>
            )}

            {/* Generated Message Content */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {currentTemplate.content}
            </div>

            {/* Outreach Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Message'}</span>
                </button>

                {currentTemplate.waLink && (
                  <a
                    href={currentTemplate.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Launch WhatsApp</span>
                  </a>
                )}

                {activeLead.business.phone && (
                  <a
                    href={`tel:${activeLead.business.phone}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Phone</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkContacted('CONTACTED')}
                  disabled={loggingCall}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleMarkContacted('INTERESTED')}
                  disabled={loggingCall}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Mark Interested
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
