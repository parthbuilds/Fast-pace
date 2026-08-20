'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Globe,
  ExternalLink,
  ShieldCheck,
  Flame,
  Sparkles,
  Calendar,
  Layers,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Copy,
  Check,
  UserCheck,
  DollarSign,
  FileQuestion,
  Loader2,
  Trash2,
  MapPin,
  CalendarClock,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { LEAD_STATUS_CONFIG, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { LeadScoreBadge } from '@/components/leads/LeadScoreBadge';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { OpportunityBadge } from '@/components/leads/OpportunityBadge';
import { generateOutreachTemplates } from '@/lib/outreach';
import { getOpportunityBlueprint } from '@/lib/intelligence';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'audit' | 'opportunities' | 'outreach' | 'timeline' | 'qualification' | 'discovery' | 'proposal'
  >('overview');

  // Audit state
  const [auditing, setAuditing] = useState(false);

  // Outreach state
  const [selectedTone, setSelectedTone] = useState<string>('whatsapp');
  const [copied, setCopied] = useState(false);

  // Interaction / Note state
  const [noteType, setNoteType] = useState('NOTE');
  const [noteSummary, setNoteSummary] = useState('');
  const [noteDetails, setNoteDetails] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Qualification State
  const [qualHasProblem, setQualHasProblem] = useState('YES');
  const [qualDecisionMaker, setQualDecisionMaker] = useState('YES');
  const [qualBudget, setQualBudget] = useState('HIGH');
  const [qualUrgency, setQualUrgency] = useState('HIGH');
  const [qualComplexity, setQualComplexity] = useState('MEDIUM');
  const [savingQual, setSavingQual] = useState(false);

  // Discovery State
  const [discBottlenecks, setDiscBottlenecks] = useState('');
  const [discEmployees, setDiscEmployees] = useState(4);
  const [discTools, setDiscTools] = useState({ excel: true, whatsapp: true, crm: false, booking: false });
  const [savingDiscovery, setSavingDiscovery] = useState(false);

  // Proposal Quick State
  const [propTitle, setPropTitle] = useState('');
  const [propPrice, setPropPrice] = useState(150000);
  const [savingProposal, setSavingProposal] = useState(false);

  const handleSelectOpportunityForProposal = (opp: any) => {
    const bp = getOpportunityBlueprint(opp.title, opp.type);
    setPropTitle(`${opp.title} for ${lead?.business?.name || 'Client'}`);
    setPropPrice(bp.pitchPrice);
    setActiveTab('proposal');
  };

  const fetchLeadDetails = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      const data = await res.json();
      if (data.success) {
        setLead(data.lead);
        if (data.lead.estimatedValue) {
          setPropPrice(data.lead.estimatedValue);
        }
        if (data.lead.qualificationStatus) {
          setQualHasProblem(data.lead.hasProblem || 'YES');
          setQualDecisionMaker(data.lead.decisionMaker || 'YES');
          setQualBudget(data.lead.budgetPotential || 'HIGH');
          setQualUrgency(data.lead.urgency || 'HIGH');
          setQualComplexity(data.lead.techComplexity || 'MEDIUM');
        }
      }
    } catch (err) {
      console.error('Fetch lead detail failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
        <span>Loading lead profile...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-slate-500 font-semibold">Lead not found</p>
        <Link href="/leads" className="text-xs text-blue-600 dark:text-blue-400 underline">
          &larr; Back to Lead Database
        </Link>
      </div>
    );
  }

  const biz = lead.business;
  const audit = lead.audit;
  const opportunities = lead.opportunities || [];
  const interactions = lead.interactions || [];

  // Generate outreach templates
  const outreachTemplates = generateOutreachTemplates({
    developerName: 'Parth',
    agencyName: 'Velocity Software Studio',
    businessName: biz.name,
    category: biz.category,
    area: biz.area,
    city: biz.city,
    websiteState: audit?.websiteStatus || (biz.website ? 'AVERAGE' : 'NO_WEBSITE'),
    detectedOpportunity: opportunities.length > 0 ? opportunities[0].title : 'Modern Web Presence',
    phone: biz.phone,
    email: biz.email,
  });

  const currentTemplate = outreachTemplates[selectedTone] || outreachTemplates.whatsapp;

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText(currentTemplate.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunLiveAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchLeadDetails();
      }
    } catch (err) {
      console.error('Audit run failed:', err);
    } finally {
      setAuditing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status: newStatus }),
      });
      if (res.ok) {
        setLead((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleSaveInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteSummary.trim()) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: noteType,
          summary: noteSummary,
          details: noteDetails,
          followUpDate: followUpDate || undefined,
        }),
      });
      if (res.ok) {
        setNoteSummary('');
        setNoteDetails('');
        setFollowUpDate('');
        await fetchLeadDetails();
      }
    } catch (err) {
      console.error('Save interaction error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingQual(true);
    const isQual = qualHasProblem === 'YES' && qualDecisionMaker === 'YES';
    const status = isQual ? 'QUALIFIED' : 'DISQUALIFIED';

    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          qualificationStatus: status,
          hasProblem: qualHasProblem,
          decisionMaker: qualDecisionMaker,
          budgetPotential: qualBudget,
          urgency: qualUrgency,
          techComplexity: qualComplexity,
          closeProbability: qualUrgency === 'HIGH' && qualBudget === 'HIGH' ? 'HIGH' : 'MEDIUM',
        }),
      });
      if (res.ok) {
        await fetchLeadDetails();
        alert(`Lead successfully qualified as: ${status}`);
      }
    } catch (err) {
      console.error('Qualify error:', err);
    } finally {
      setSavingQual(false);
    }
  };

  const handleSaveDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDiscovery(true);
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          employeesCount: discEmployees,
          usesExcel: discTools.excel,
          usesWhatsApp: discTools.whatsapp,
          usesCrm: discTools.crm,
          usesBooking: discTools.booking,
          hasWebsite: Boolean(biz.website),
          manualWorkBottlenecks: discBottlenecks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchLeadDetails();
        alert('Discovery session recorded! Solution synthesized.');
      }
    } catch (err) {
      console.error('Discovery error:', err);
    } finally {
      setSavingDiscovery(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProposal(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          title: propTitle || `Digital Transformation Solution for ${biz.name}`,
          problemStatement: discBottlenecks || `Manual operations bottleneck and missing high-converting direct booking engine for ${biz.name}.`,
          proposedSolution: `Deploy custom mobile-first website with automated WhatsApp booking and customer CRM.`,
          scopeFeatures: [
            'Responsive high-speed web application',
            '24/7 direct customer self-service booking',
            'WhatsApp automated reminders & confirmations',
            'Admin analytics dashboard for lead tracking',
          ],
          timelineWeeks: 3,
          price: Number(propPrice),
          status: 'SENT',
        }),
      });
      if (res.ok) {
        await fetchLeadDetails();
        alert('Proposal generated and logged in CRM!');
      }
    } catch (err) {
      console.error('Proposal error:', err);
    } finally {
      setSavingProposal(false);
    }
  };

  return (
    <div className="space-y-6  mx-auto pb-16">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{biz.name}</h1>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {biz.category} {biz.subcategory ? `(${biz.subcategory})` : ''} •{' '}
              {biz.address || biz.area || 'Bangalore'} •{' '}
              {biz.distanceKm !== null ? `${biz.distanceKm} km away` : ''}
            </p>
          </div>
        </div>

        {/* Action Header Items */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Stage:</span>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-transparent text-blue-600 dark:text-blue-400 font-semibold focus:outline-none cursor-pointer"
            >
              {Object.keys(LEAD_STATUS_CONFIG).map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {LEAD_STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <OpportunityScoreBadge score={lead.opportunityScore} size="md" />
            <LeadScoreBadge score={lead.leadScore} size="md" />
          </div>

          {currentTemplate.waLink && (
            <a
              href={currentTemplate.waLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          {biz.phone && (
            <a
              href={`tel:${biz.phone}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name + ' ' + (biz.address || ''))}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Verify on Google Maps</span>
          </a>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#111827] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        {[
          { id: 'overview', label: 'Lead 360 Overview' },
          { id: 'audit', label: 'Digital Audit' },
          { id: 'opportunities', label: `Opportunities (${opportunities.length})` },
          { id: 'outreach', label: 'Outreach Workspace' },
          { id: 'timeline', label: `Timeline & Notes (${interactions.length})` },
          { id: 'qualification', label: 'Qualification' },
          { id: 'discovery', label: 'Client Discovery' },
          { id: 'proposal', label: 'Proposal Builder' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Business & Contact Info */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Business Registry
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Category</span>
                <span className="text-slate-900 dark:text-white font-semibold">{biz.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Address</span>
                <span className="text-slate-700 dark:text-slate-300">{biz.address || 'HSR Layout, Bangalore'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Direct Phone</span>
                {biz.phone ? (
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{biz.phone}</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">No phone listed</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Website</span>
                {biz.website ? (
                  <a
                    href={biz.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium truncate max-w-full"
                  >
                    <span className="truncate">{biz.website}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">⚠️ No official website</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Email Address</span>
                {biz.email ? (
                  <a
                    href={`mailto:${biz.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium truncate max-w-full"
                  >
                    <span className="truncate">{biz.email}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">No email listed</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Operating Hours</span>
                <span className="text-slate-700 dark:text-slate-300">{biz.openingHours || 'Standard Business Hours'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Est. Deal Value</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {formatCurrency(lead.estimatedValue || 150000)}
                </span>
              </div>
            </div>
          </div>

          {/* Middle Column: Top Software Opportunities */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detected Software Opportunities
              </h3>
              <OpportunityScoreBadge score={lead.opportunityScore} />
            </div>

            <div className="space-y-3">
              {opportunities.map((opp: any) => {
                const bp = getOpportunityBlueprint(opp.title, opp.type);
                return (
                  <div
                    key={opp.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <OpportunityBadge type={opp.type} title={opp.title} />
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">⏱️ Timeline: {bp.implementationTimeline}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap">
                        {opp.confidenceScore}% Opportunity Confidence
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{opp.reason || opp.description}</p>

                    {/* Tech Stack & Free Tools */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tech Stack & Free Tools</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Free Tiers / $0 Dev Cost</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {bp.techStack.map((tech: string) => (
                          <span key={tech} className="text-[9px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-700/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Financial Matrix */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-white dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-medium">Pitch Price</span>
                        <strong className="text-slate-900 dark:text-white text-xs">{formatCurrency(bp.pitchPrice)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Dev Cost</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 text-xs">₹0 ($0 APIs)</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Net Profit</span>
                        <strong className="text-indigo-600 dark:text-indigo-400 text-xs">{formatCurrency(bp.estimatedProfit)} ({bp.profitMarginPercent}%)</strong>
                      </div>
                    </div>

                    {/* Client ROI Box */}
                    <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 text-[10px] text-emerald-900 dark:text-emerald-300">
                      <strong className="font-bold block text-emerald-950 dark:text-emerald-200 mb-0.5">💰 Client ROI & Value Proposition:</strong>
                      <span>{bp.clientProfitROI}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectOpportunityForProposal(opp)}
                      className="w-full py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pitch Solution (Pre-fill Proposal) &rarr;</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Quick Outreach & Next Action */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Outreach Preview
              </h3>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {outreachTemplates.whatsapp.content}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('outreach')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open Full Outreach Workspace</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Log Call / Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL AUDIT */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Digital Opportunity Audit Breakdown</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Non-intrusive heuristic signals on website readiness, booking capability, and contact conversions.
              </p>
            </div>

            <button
              onClick={handleRunLiveAudit}
              disabled={auditing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditing ? 'animate-spin' : ''}`} />
              <span>{auditing ? 'Running Scan...' : 'Re-Run Live Audit'}</span>
            </button>
          </div>

          {audit ? (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500">Website Status</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{audit.websiteStatus}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500">Audit Score</span>
                  <div className="text-sm font-bold text-amber-500">{audit.overallScore} / 100</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500">SSL / HTTPS</span>
                  <div className={`text-sm font-bold ${audit.isHttps ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {audit.isHttps ? '✓ Enabled' : '✕ Missing'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500">Mobile Friendly</span>
                  <div className={`text-sm font-bold ${audit.mobileFriendly ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {audit.mobileFriendly ? '✓ Optimized' : '✕ Not Responsive'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                  Public Conversion Friction Findings
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-xs">{audit.summaryText}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No audit report generated yet. Click &ldquo;Re-Run Live Audit&rdquo; to analyze this business.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Detected Opportunity Blueprints & Pitch Playbooks</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed tech stacks, 100% free tool alternatives, pricing matrices, and ROI pitches for {biz.name}.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-500/30 whitespace-nowrap">
              {opportunities.length} High-Impact Opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {opportunities.map((opp: any) => {
              const bp = getOpportunityBlueprint(opp.title, opp.type);
              return (
                <div
                  key={opp.id}
                  className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <OpportunityBadge type={opp.type} title={opp.title} />
                        <span className="text-xs text-slate-400 font-mono">⏱️ {bp.implementationTimeline}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {opp.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap">
                        {opp.confidenceScore}% Opportunity Confidence
                      </span>
                    </div>
                  </div>

                  {/* Problem & Diagnosis */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Problem & Opportunity Diagnosis
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {opp.reason || opp.description}
                    </p>
                  </div>

                  {/* Tech Stack & 100% Free Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        🛠️ Recommended Tech Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {bp.techStack.map((tech: string) => (
                          <span key={tech} className="text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        🎁 Free Tools & $0 Alternatives (Zero Developer Setup Cost)
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {bp.freeAlternatives.map((alt: string) => (
                          <li key={alt} className="flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Scope Deliverables */}
                  <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      📋 What The Client Receives (Scope Deliverables)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                      {bp.deliverables.map((del: string) => (
                        <div key={del} className="flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold mt-0.5">•</span>
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Earnings Matrix & Client Profit Box */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                        Recommended Pitch Price
                      </span>
                      <div className="text-xl font-black text-indigo-900 dark:text-indigo-200">
                        {formatCurrency(bp.pitchPrice)}
                      </div>
                      <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400 block">Upfront one-time build fee</span>
                    </div>

                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                        Your Net Earnings (Profit)
                      </span>
                      <div className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                        {formatCurrency(bp.estimatedProfit)}
                      </div>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400 block">
                        {bp.profitMarginPercent}% Margin (₹0 Dev tool cost)
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Client SaaS / Cloud Hosting
                      </span>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(bp.clientMonthlySaaS)}<span className="text-xs font-normal text-slate-400">/mo</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Billed directly to client</span>
                    </div>
                  </div>

                  {/* Client Business Profit & ROI Case */}
                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-1 text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Why The Client Will Buy (Profit & ROI Justification)</span>
                    </span>
                    <p className="text-amber-950 dark:text-amber-200/90 leading-relaxed text-[11px]">
                      {bp.clientProfitROI}
                    </p>
                  </div>

                  {/* Pitch Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleSelectOpportunityForProposal(opp)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Pre-fill Proposal With This Scope</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: OUTREACH WORKSPACE */}
      {activeTab === 'outreach' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
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
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedTone === tone.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
              >
                {tone.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {currentTemplate.content}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleCopyOutreach}
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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Launch WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TIMELINE & NOTES */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Note Logger */}
          <form onSubmit={handleSaveInteraction} className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
              Log Outreach Call / Add Timeline Note
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Interaction Type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <option value="NOTE">General Note</option>
                  <option value="CALLED">Phone Call</option>
                  <option value="WHATSAPP_SENT">WhatsApp Sent</option>
                  <option value="MEETING">In-Person Meeting</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Summary Headline</label>
                <input
                  type="text"
                  value={noteSummary}
                  onChange={(e) => setNoteSummary(e.target.value)}
                  placeholder="e.g. Spoke to Manager, requested proposal"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Schedule Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Details & Context</label>
              <textarea
                value={noteDetails}
                onChange={(e) => setNoteDetails(e.target.value)}
                rows={2}
                placeholder="Key takeaways, objections, software feature requests..."
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingNote}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                {savingNote ? 'Saving...' : 'Record Interaction'}
              </button>
            </div>
          </form>

          {/* Historical Log */}
          <div className="space-y-3">
            {interactions.map((it: any) => (
              <div
                key={it.id}
                className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{it.type}</span>
                  <span>{formatDate(it.createdAt)} ({formatRelativeTime(it.createdAt)})</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">{it.summary}</div>
                {it.details && <p className="text-slate-600 dark:text-slate-300 pt-1">{it.details}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: QUALIFICATION */}
      {activeTab === 'qualification' && (
        <form onSubmit={handleSaveQualification} className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm text-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Client Opportunity Qualification Matrix</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Has Identifiable Software Problem?</label>
              <select
                value={qualHasProblem}
                onChange={(e) => setQualHasProblem(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="YES">Yes - Clear bottleneck detected</option>
                <option value="NO">No - Already has modern systems</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Direct Decision Maker Access?</label>
              <select
                value={qualDecisionMaker}
                onChange={(e) => setQualDecisionMaker(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="YES">Yes - Talking to Owner / Founder</option>
                <option value="NO">No - Front desk gatekeeper only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Estimated Budget Potential</label>
              <select
                value={qualBudget}
                onChange={(e) => setQualBudget(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="HIGH">High ($1,500 - $4,000+)</option>
                <option value="MEDIUM">Medium ($800 - $1,500)</option>
                <option value="LOW">Low (&lt; $800)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Buying Urgency</label>
              <select
                value={qualUrgency}
                onChange={(e) => setQualUrgency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="HIGH">High - Ready to kickoff this week</option>
                <option value="MEDIUM">Medium - Exploring options</option>
                <option value="LOW">Low - Just browsing</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingQual}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {savingQual ? 'Saving...' : 'Save & Update Qualification'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: DISCOVERY */}
      {activeTab === 'discovery' && (
        <form onSubmit={handleSaveDiscovery} className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm text-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Discovery Intake Session</h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">What is their main daily operational pain?</label>
              <textarea
                value={discBottlenecks}
                onChange={(e) => setDiscBottlenecks(e.target.value)}
                rows={3}
                placeholder="e.g. Taking phone appointments manually on a physical register creates double bookings..."
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-3 border border-slate-300 dark:border-slate-700"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingDiscovery}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer"
            >
              {savingDiscovery ? 'Synthesizing...' : 'Save Discovery & Synthesize Scope'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 8: PROPOSAL BUILDER */}
      {activeTab === 'proposal' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick Proposal Creator</h2>
            <Link
              href={`/proposals?leadId=${lead.id}`}
              className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
            >
              Open Full Proposal Studio &rarr;
            </Link>
          </div>

          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Proposal Title</label>
              <input
                type="text"
                value={propTitle}
                onChange={(e) => setPropTitle(e.target.value)}
                placeholder={`e.g. Online Booking & WhatsApp System for ${biz.name}`}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Fixed Project Investment (₹ INR)</label>
              <input
                type="number"
                value={propPrice}
                onChange={(e) => setPropPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProposal}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/20 cursor-pointer"
              >
                {savingProposal ? 'Saving...' : 'Generate & Log Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
