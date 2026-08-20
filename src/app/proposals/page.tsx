'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
  DollarSign,
  Calendar,
  Send,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProposalBuilderPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Proposal State
  const [title, setTitle] = useState('Digital Transformation & Direct Customer System');
  const [problemStatement, setProblemStatement] = useState(
    'The business currently lacks a high-converting web presence and self-service online booking, leading to customer drop-offs and heavy front-desk telephone overhead.'
  );
  const [proposedSolution, setProposedSolution] = useState(
    'A custom mobile-first website integrated with automated WhatsApp booking reminders and client CRM.'
  );
  const [price, setPrice] = useState<number>(1800);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(3);
  const [maintenance, setMaintenance] = useState(
    '30 days of complimentary priority bug fixes, security patches, and performance optimization included post-launch.'
  );

  const [features, setFeatures] = useState<string[]>([
    'Responsive mobile-first web application',
    'Self-service online booking & slot availability engine',
    'Automated WhatsApp booking confirmations & reminder alerts',
    'Custom Admin Operations dashboard for schedule management',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedProposal, setSavedProposal] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success && data.leads.length > 0) {
          setLeads(data.leads);
          setSelectedLeadId(data.leads[0].id);
          setTitle(`Digital Transformation & Web System for ${data.leads[0].business.name}`);
        }
      } catch (err) {
        console.error('Fetch leads for proposal error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleLeadChange = (id: string) => {
    setSelectedLeadId(id);
    const l = leads.find((item) => item.id === id);
    if (l) {
      setTitle(`Custom Web & Automation Solution for ${l.business.name}`);
      if (l.opportunities?.length > 0) {
        setProposedSolution(`Deploy ${l.opportunities[0].title} with unified WhatsApp integration.`);
      }
    }
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSaveProposal = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          title,
          problemStatement,
          proposedSolution,
          scopeFeatures: features,
          timelineWeeks,
          price,
          maintenanceTerms: maintenance,
          status: 'SENT',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedProposal(data.proposal);
        alert('Proposal generated and logged in database!');
      }
    } catch (err) {
      console.error('Save proposal failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="space-y-6 mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            <span>Interactive Proposal Generator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn discovery findings into clear, high-converting client proposals with scope milestones and print/PDF export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print / Export to PDF</span>
          </button>

          <button
            onClick={handleSaveProposal}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Save & Deliver Proposal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form Editor */}
        <div className="md:col-span-5 bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 text-xs shadow-sm print:hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Proposal Parameters
          </h2>

          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 font-semibold">Select Client / Lead</label>
            <select
              value={selectedLeadId}
              onChange={(e) => handleLeadChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.business.name} ({l.business.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 font-semibold">Proposal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 font-semibold">Problem Diagnosis</label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 font-semibold">Proposed Solution</label>
            <textarea
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Price ($ USD)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Timeline (Weeks)</label>
              <input
                type="number"
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Scope Features Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-slate-600 dark:text-slate-400 font-semibold">Scope Deliverables ({features.length})</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {features.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{f}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="text-rose-500 hover:text-rose-600 ml-2 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                placeholder="Add deliverable feature..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-semibold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Formal Proposal Preview (Print Friendly) */}
        <div className="md:col-span-7 bg-white text-slate-900 rounded-2xl p-8 shadow-xl border border-slate-200 space-y-6 font-sans">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="text-lg font-black text-blue-700 tracking-tight">
                VELOCITY SOFTWARE STUDIO
              </div>
              <p className="text-xs text-slate-500">Custom Software & Web Engineering</p>
              <p className="text-xs text-slate-500">HSR Layout, Bangalore • parth@velocitystudio.io</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PROPOSAL
              </div>
              <div className="text-xs text-slate-600 mt-1">Date: {formatDate(new Date())}</div>
              <div className="text-xs font-semibold text-blue-600">Ref: FP-PROP-{selectedLead?.id?.slice(0, 6).toUpperCase()}</div>
            </div>
          </div>

          {/* Client target */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Prepared For
            </span>
            <div className="font-bold text-sm text-slate-900">{selectedLead?.business?.name}</div>
            <p className="text-xs text-slate-600">{selectedLead?.business?.address || 'Bangalore, India'}</p>
          </div>

          {/* Proposal Title */}
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>

          {/* Problem & Solution */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">1. Challenge & Opportunity</span>
              <p>{problemStatement}</p>
            </div>
            <div>
              <span className="font-bold text-slate-900 block mb-0.5">2. Proposed Solution Architecture</span>
              <p>{proposedSolution}</p>
            </div>
          </div>

          {/* Deliverables List */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-900 block">3. Scope Deliverables & Features</span>
            <ul className="space-y-1.5 pl-1">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Investment & Payment Schedule */}
          <div className="space-y-2 text-xs border-t border-slate-200 pt-4">
            <span className="font-bold text-slate-900 block">4. Project Investment & Milestone Schedule</span>
            <div className="flex items-baseline justify-between p-3 bg-blue-50 rounded-lg text-blue-900 font-semibold">
              <span>Total Fixed Price:</span>
              <span className="text-base font-extrabold text-blue-700">{formatCurrency(price)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="font-bold block text-slate-900">50% Kickoff</span>
                <span>{formatCurrency(price * 0.5)}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="font-bold block text-slate-900">30% UAT Testing</span>
                <span>{formatCurrency(price * 0.3)}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="font-bold block text-slate-900">20% Live Launch</span>
                <span>{formatCurrency(price * 0.2)}</span>
              </div>
            </div>
          </div>

          {/* Signoff block */}
          <div className="pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-600">
            <div>
              <div className="h-10 border-b border-slate-300 w-40 mb-1" />
              <span>Prepared by: Parth</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-300 w-40 mb-1" />
              <span>Accepted by: {selectedLead?.business?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
