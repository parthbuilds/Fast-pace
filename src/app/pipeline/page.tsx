'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Kanban,
  Plus,
  Loader2,
} from 'lucide-react';
import { LEAD_STATUS_CONFIG, formatCurrency } from '@/lib/utils';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';

interface KanbanColumnDef {
  id: string;
  label: string;
  statuses: string[];
  color: string;
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { id: 'new', label: 'New & Researched', statuses: ['NEW', 'RESEARCHED'], color: 'border-blue-500 text-blue-600 dark:text-blue-400' },
  { id: 'contacted', label: 'Contacted / WhatsApp', statuses: ['CONTACTED', 'WHATSAPP_SENT', 'CALLED'], color: 'border-sky-500 text-sky-600 dark:text-sky-400' },
  { id: 'interested', label: 'Interested & Qualified', statuses: ['INTERESTED'], color: 'border-amber-500 text-amber-600 dark:text-amber-400' },
  { id: 'discovery', label: 'Discovery Stage', statuses: ['DISCOVERY_SCHEDULED', 'DISCOVERY_COMPLETED'], color: 'border-purple-500 text-purple-600 dark:text-purple-400' },
  { id: 'proposal', label: 'Proposal & Negotiation', statuses: ['PROPOSAL_SENT', 'NEGOTIATING'], color: 'border-pink-500 text-pink-600 dark:text-pink-400' },
  { id: 'won', label: 'Closed Won (Clients)', statuses: ['WON'], color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelineLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Fetch pipeline leads error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineLeads();
  }, []);

  const handleMoveStage = async (leadId: string, newStatus: string) => {
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
      console.error('Move stage error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
        <span>Loading sales pipeline...</span>
      </div>
    );
  }

  const totalPipelineValue = leads
    .filter((l) => !['LOST', 'DO_NOT_CONTACT'].includes(l.status))
    .reduce((sum, l) => sum + (l.estimatedValue || 1500), 0);

  return (
    <div className="space-y-6 max-w-full mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-500" />
            <span>Visual Sales Pipeline Board</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track deals from initial OpenStreetMap discovery to signed software contracts. Total pipeline:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalPipelineValue)}</strong>
          </p>
        </div>

        <Link
          href="/finder"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Leads</span>
        </Link>
      </div>

      {/* Kanban Horizontal Board */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 overflow-x-auto pb-4 items-start min-w-[1200px]">
        {KANBAN_COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => col.statuses.includes(l.status));
          const colValue = colLeads.reduce((sum, l) => sum + (l.estimatedValue || 1500), 0);

          return (
            <div
              key={col.id}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 min-h-[600px] flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                  <div className="font-bold text-xs">{col.label}</div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                    {colLeads.length}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Value: <strong className="text-slate-900 dark:text-white">{formatCurrency(colValue)}</strong>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm group"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors block leading-tight"
                        >
                          {lead.business.name}
                        </Link>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {lead.business.category} • {lead.business.area || 'Bangalore'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <OpportunityScoreBadge score={lead.opportunityScore} size="sm" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(lead.estimatedValue || 1500)}
                        </span>
                      </div>

                      {/* Move to next stage quick action */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">
                          {lead.business.phone || 'No phone'}
                        </span>
                        <select
                          value={lead.status}
                          onChange={(e) => handleMoveStage(lead.id, e.target.value)}
                          className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-[10px] rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {Object.keys(LEAD_STATUS_CONFIG).map((st) => (
                            <option key={st} value={st}>
                              {LEAD_STATUS_CONFIG[st].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
