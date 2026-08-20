'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileQuestion,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function ClientDiscoveryHubPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Discovery fields
  const [employees, setEmployees] = useState(5);
  const [locations, setLocations] = useState(1);
  const [customers, setCustomers] = useState(250);
  const [contactMethods, setContactMethods] = useState('Phone calls & Walk-ins');
  const [usesExcel, setUsesExcel] = useState(true);
  const [usesWhatsApp, setUsesWhatsApp] = useState(true);
  const [usesCrm, setUsesCrm] = useState(false);
  const [usesBooking, setUsesBooking] = useState(false);
  const [manualBottlenecks, setManualBottlenecks] = useState('');
  const [enquiryLoss, setEnquiryLoss] = useState('');
  const [automationWishes, setAutomationWishes] = useState('');

  const [synthesizing, setSynthesizing] = useState(false);
  const [resultDiscovery, setResultDiscovery] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success && data.leads.length > 0) {
          setLeads(data.leads);
          setSelectedLeadId(data.leads[0].id);
        }
      } catch (err) {
        console.error('Fetch discovery leads error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    setSynthesizing(true);
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          employeesCount: employees,
          locationsCount: locations,
          monthlyCustomers: customers,
          contactMethods,
          usesExcel,
          usesWhatsApp,
          usesCrm,
          usesBooking,
          manualWorkBottlenecks: manualBottlenecks,
          enquiryLossPoints: enquiryLoss,
          automationWishes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResultDiscovery(data.discovery);
      }
    } catch (err) {
      console.error('Synthesize discovery failed:', err);
    } finally {
      setSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto pb-16">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-purple-500" />
          <span>Client Discovery & Solution Scoping Studio</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Conduct deep client discovery interviews to synthesize real software bottlenecks and generate clear MVP vs Phase 2 scopes.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <form onSubmit={handleSynthesize} className="space-y-6 text-xs">
          {/* Pick Lead */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Business Prospect</label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 border border-slate-300 dark:border-slate-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.business.name} ({lead.business.category}) — Opp Score: {lead.opportunityScore}
                </option>
              ))}
            </select>
          </div>

          {/* Business Context */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Employee Count</label>
              <input
                type="number"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Physical Locations</label>
              <input
                type="number"
                value={locations}
                onChange={(e) => setLocations(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Monthly Customer Volume</label>
              <input
                type="number"
                value={customers}
                onChange={(e) => setCustomers(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Current Tools */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Currently Used Software & Systems</label>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usesExcel}
                  onChange={(e) => setUsesExcel(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-800"
                />
                <span>Excel / Google Sheets</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usesWhatsApp}
                  onChange={(e) => setUsesWhatsApp(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-800"
                />
                <span>Manual WhatsApp</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usesCrm}
                  onChange={(e) => setUsesCrm(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-800"
                />
                <span>CRM Tool</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usesBooking}
                  onChange={(e) => setUsesBooking(e.target.checked)}
                  className="rounded bg-slate-100 dark:bg-slate-800"
                />
                <span>Online Booking Engine</span>
              </label>
            </div>
          </div>

          {/* Bottlenecks Questions */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">
                What takes the most manual staff work or causes repetitive data entry?
              </label>
              <textarea
                value={manualBottlenecks}
                onChange={(e) => setManualBottlenecks(e.target.value)}
                rows={2}
                placeholder="e.g. Front desk calls each patient manually to confirm appointment slots 1 day prior..."
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 border border-slate-300 dark:border-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">
                Where do inquiries or customer requests get lost / delayed?
              </label>
              <textarea
                value={enquiryLoss}
                onChange={(e) => setEnquiryLoss(e.target.value)}
                rows={2}
                placeholder="e.g. Inquiries after 8:00 PM go to voicemail with zero instant response..."
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 border border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={synthesizing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {synthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Solution...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Solution & MVP Scope</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Synthesized Output Card */}
      {resultDiscovery && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-purple-300 dark:border-purple-500/40 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Synthesized Solution Architecture</h2>
            </div>
            <Link
              href={`/proposals?leadId=${selectedLeadId}`}
              className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Build Client Proposal &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Identified Core Problem</span>
              <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-medium">{resultDiscovery.synthesizedProblem}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Recommended Software Solution</span>
              <p className="text-slate-900 dark:text-slate-200 leading-relaxed font-medium">{resultDiscovery.recommendedSolution}</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-500/30 space-y-1.5">
              <span className="font-bold text-purple-700 dark:text-purple-400 uppercase text-[10px]">Phase 1: Recommended MVP Scope</span>
              <p className="text-purple-900 dark:text-purple-200 leading-relaxed font-semibold">{resultDiscovery.mvpScope}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Phase 2: Future Expansion</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{resultDiscovery.phase2Scope}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Expected Qualitative Benefits</span>
            <p className="text-slate-700 dark:text-slate-300">{resultDiscovery.expectedBenefits}</p>
          </div>
        </div>
      )}
    </div>
  );
}
