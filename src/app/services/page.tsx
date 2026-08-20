'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Briefcase,
  Layers,
  Laptop,
  Bot,
  TrendingUp,
} from 'lucide-react';
import { SOFTWARE_MODULES } from '@/lib/intelligence';
import { formatCurrency } from '@/lib/utils';

// Detailed mapping of deliverables and value propositions per software module
const MODULE_DETAILS_MAP: Record<
  string,
  {
    deliverables: string[];
    roi: string;
    industries: string[];
  }
> = {
  business_website: {
    deliverables: [
      'Custom Next.js mobile-responsive architecture',
      'Google Search Console setup & basic SEO schema',
      'Contact forms & interactive location maps',
      'Domain registration & SSL certificate hosting setup',
      'Self-manageable visual CMS or markdown support',
    ],
    roi: 'Build professional trust, rank on local Google search queries, and capture search traffic directly without middleman fees.',
    industries: ['Professional Services', 'Health', 'Hospitality', 'Retail', 'Beauty'],
  },
  website_redesign: {
    deliverables: [
      'Visual rebranding & modern interface overhaul',
      'Google PageSpeed mobile score optimization (90+)',
      'Broken link fixing & URL redirect mappings',
      'Conversion rate optimization (CRO) CTA placement',
      'High-resolution optimized asset compression',
    ],
    roi: 'Retain visitors who bounce due to slow loading speeds. Increase conversions of existing traffic by 1.5x–3x.',
    industries: ['Any business with an old, slow, or non-responsive website'],
  },
  appointment_booking: {
    deliverables: [
      'Self-service booking widget (calendar slot selection)',
      'Google Calendar, Apple, or Outlook sync rules',
      'Intake/consultation questionnaire setup',
      'Deposit payment hook (Stripe/UPI integration)',
      'Automated email/SMS confirmation sequence',
    ],
    roi: 'Eliminate manual phone call booking loops. Allow bookings 24/7, reducing front-desk fatigue and scheduling conflicts.',
    industries: ['Health', 'Beauty', 'Fitness', 'Professional Services', 'Hotels'],
  },
  whatsapp_automation: {
    deliverables: [
      'Official WhatsApp Business Cloud API config',
      'Interactive quick-reply buttons & greeting flows',
      'Lead routing rules to key staff phone numbers',
      'Automated Google review link trigger after service',
      'Broadcast template drafts for client marketing list',
    ],
    roi: 'Engage incoming mobile prospects in under 60 seconds. Increase reviews by 50% through automated follow-up nudges.',
    industries: ['Food', 'Beauty', 'Health', 'Retail', 'Fitness', 'Real Estate'],
  },
  lead_crm: {
    deliverables: [
      'Visual sales Kanban board showing deal pipeline stages',
      'Lead history dashboard & customer interaction logger',
      'Scheduled task scheduler with reminder notifications',
      'Enquiry source tracker (Google vs Instagram vs Referral)',
      'Team member access roles & assignment controls',
    ],
    roi: 'Prevent lead leakage. Know exactly where your sales stand, centralize communication, and scale your client tracking.',
    industries: ['Real Estate', 'Professional Services', 'Events', 'Education', 'Gyms'],
  },
  online_ordering_menu: {
    deliverables: [
      'Interactive responsive web menu with dish customizers',
      'Zero-commission cart, checkout, & payment routing',
      'Real-time order alerts on staff dashboard / WhatsApp',
      'Dine-in table QR code generator',
      'Promo code manager & custom discount logic',
    ],
    roi: 'Bypass hefty 20-30% aggregator commission rates (Zomato/UberEats). Own your customer relationship and database.',
    industries: ['Food', 'Restaurants', 'Cafes', 'Bakeries'],
  },
  customer_loyalty: {
    deliverables: [
      'Digital point-accumulation system (spend $X, get Y points)',
      'VIP Tier configurations (Silver, Gold, Platinum)',
      'Unique digital customer pass / account dashboard',
      'WhatsApp/SMS integration for point updates',
      'Milestone automated promotion triggers',
    ],
    roi: 'Increase client repeat frequency by 25-45%. Build a loyal user base that spends more per visit.',
    industries: ['Beauty', 'Food', 'Retail', 'Fitness'],
  },
  payment_billing: {
    deliverables: [
      'UPI, Stripe, Credit/Debit card gateway integrations',
      'Instant professional PDF receipt/invoice generator',
      'Custom invoice link creator (pay in 1-click)',
      'Automatic payment reminder loops for outstanding bills',
      'Multi-currency payment support options',
    ],
    roi: 'Get paid faster. Cut down invoice chasing hours and streamline accounting reconciliation.',
    industries: ['Professional Services', 'Education', 'Events', 'Real Estate'],
  },
  analytics_dashboard: {
    deliverables: [
      'Live metric charts (Revenue, Orders, Bookings)',
      'Peak customer hours & staff utilization logs',
      'Comparison tools (this month vs last month performance)',
      'Exportable spreadsheet reports (.csv, .xlsx)',
      'Custom KPI threshold email alerts',
    ],
    roi: 'Ditch the guesswork. View actual business health at a glance to optimize labor, pricing, and services.',
    industries: ['Hospitality', 'Health', 'Retail', 'Fitness', 'Restaurants'],
  },
  ai_chatbot: {
    deliverables: [
      'Website chat widget trained on your custom business FAQs',
      'Intelligent lead qualification flow (name, email, phone)',
      'Real-time handoff to human support triggers',
      'Visual chat history dashboard inside admin portal',
      'Custom styling & brand voice calibration',
    ],
    roi: 'Answer common questions instantly 24/7. Capture qualified contact details from late-night site visitors.',
    industries: ['Professional Services', 'Real Estate', 'Education', 'Retail'],
  },
  ai_voice_agent: {
    deliverables: [
      'Custom AI voice agent configuration (Vapi/Bland.ai)',
      'Trained interactive voice script tailored to your catalog',
      'Direct calendar booking sync during live phone calls',
      'Automatic call summary & action item alerts sent via email/SMS',
      'Outbound follow-up call sequence configuration',
    ],
    roi: 'Never miss another customer phone call. Automatically handle booking requests, query answers, and front-desk chores 24/7.',
    industries: ['Health', 'Beauty', 'Hospitality', 'Fitness', 'Professional Services'],
  },
  internal_portal: {
    deliverables: [
      'Role-based portal for internal staff tasks',
      'Shift scheduler & shift swap approval module',
      'Inventory depletion warnings & low-stock reports',
      'Internal chat boards & daily shift checklists',
      'Secure document archive for compliance',
    ],
    roi: 'Organize team tasks, reduce paperwork errors, and coordinate staff operations in one clear portal.',
    industries: ['Hospitality', 'Health', 'Food', 'Professional Services'],
  },
};

export default function ServicesPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['business_website']);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'automation' | 'ai' | 'operations'>('all');

  // Filter modules based on category tab
  const filteredModules = useMemo(() => {
    if (activeTab === 'all') return SOFTWARE_MODULES;
    return SOFTWARE_MODULES.filter((m) => m.category === activeTab);
  }, [activeTab]);

  // Pricing calculations
  const totalCost = useMemo(() => {
    return selectedIds.reduce((sum, id) => {
      const mod = SOFTWARE_MODULES.find((m) => m.id === id);
      return sum + (mod?.basePriceUSD || 0);
    }, 0);
  }, [selectedIds]);

  const totalWeeks = useMemo(() => {
    return selectedIds.reduce((sum, id) => {
      const mod = SOFTWARE_MODULES.find((m) => m.id === id);
      return sum + (mod?.estimatedWeeks || 0);
    }, 0);
  }, [selectedIds]);

  const monthlyRetainer = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    // Heuristic base retainer calculation
    if (totalCost < 1500) return 150;
    if (totalCost < 3000) return 299;
    if (totalCost < 6000) return 499;
    return 799;
  }, [totalCost, selectedIds]);

  const toggleModule = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Generate a premium copyable freelance proposal draft
  const proposalDraftText = useMemo(() => {
    const selectedModules = SOFTWARE_MODULES.filter((m) => selectedIds.includes(m.id));
    let draft = `### Freelance Software Solution Proposal\n\n`;
    draft += `**Estimated Project Timeline:** ${totalWeeks} Weeks\n`;
    draft += `**Total Build Investment:** ${formatCurrency(totalCost)} USD\n`;
    draft += `**Monthly Support & Maintenance Retainer:** ${formatCurrency(monthlyRetainer)} USD/month\n\n`;
    draft += `---\n\n`;
    draft += `#### Scope of Deliverables\n\n`;

    selectedModules.forEach((m, idx) => {
      const details = MODULE_DETAILS_MAP[m.id];
      draft += `${idx + 1}. **${m.name}** (${formatCurrency(m.basePriceUSD)} | ${m.estimatedWeeks} Weeks)\n`;
      draft += `   *Description:* ${m.description}\n`;
      if (details) {
        draft += `   *What You Receive:*\n`;
        details.deliverables.forEach((d) => {
          draft += `     - ${d}\n`;
        });
        draft += `   *Business Impact:* ${details.roi}\n`;
      }
      draft += `\n`;
    });

    draft += `#### Payment Schedule Milestones\n`;
    draft += `- **50% Upfront Kickoff Deposit:** ${formatCurrency(totalCost * 0.5)} USD\n`;
    draft += `- **30% User Acceptance Testing (UAT) Release:** ${formatCurrency(totalCost * 0.3)} USD\n`;
    draft += `- **20% Production Deployment & Launch:** ${formatCurrency(totalCost * 0.2)} USD\n\n`;
    draft += `*Note: Hosting fees, custom API credits, and third-party subscription charges are client responsibilities. Net-15 invoicing rules apply.*`;
    return draft;
  }, [selectedIds, totalCost, totalWeeks, monthlyRetainer]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Services & Pricing Catalog</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select feature modules to dynamically build pricing models, view custom deliverables, and copy formatted pitches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Services Grid (2 Columns Span) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            {(['all', 'web', 'automation', 'ai', 'operations'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'all'
                  ? 'All Packages'
                  : tab === 'web'
                  ? 'Web Solutions'
                  : tab === 'automation'
                  ? 'Automations'
                  : tab === 'ai'
                  ? 'AI Services'
                  : 'Operations & CRM'}
              </button>
            ))}
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModules.map((module) => {
              const isSelected = selectedIds.includes(module.id);
              const details = MODULE_DETAILS_MAP[module.id];
              return (
                <div
                  key={module.id}
                  onClick={() => toggleModule(module.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/15 border-indigo-500 dark:border-indigo-500/50 shadow-md shadow-indigo-500/5'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  {/* Category Badge Icon */}
                  <div className="absolute top-5 right-5 flex gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        module.category === 'ai'
                          ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                          : module.category === 'automation'
                          ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                          : module.category === 'web'
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20'
                      }`}
                    >
                      {module.highlightTag}
                    </span>
                  </div>

                  <div>
                    {/* Module Title */}
                    <div className="flex items-center gap-2 mb-2 pr-20">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : module.category === 'ai' ? (
                          <Bot className="w-3.5 h-3.5" />
                        ) : module.category === 'web' ? (
                          <Laptop className="w-3.5 h-3.5" />
                        ) : module.category === 'automation' ? (
                          <Sparkles className="w-3.5 h-3.5" />
                        ) : (
                          <Layers className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                        {module.name}
                      </h3>
                    </div>

                    {/* Module Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {module.description}
                    </p>

                    {/* What They Receive Checkmarks */}
                    {details && (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          What They Receive:
                        </h4>
                        <ul className="space-y-1.5">
                          {details.deliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 leading-tight">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {details.deliverables.length > 3 && (
                            <li className="text-[10px] text-indigo-500 font-semibold pl-5">
                              + {details.deliverables.length - 3} more deliverables
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Pricing / Duration bottom bar */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {module.estimatedWeeks} {module.estimatedWeeks === 1 ? 'Week' : 'Weeks'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 text-slate-900 dark:text-white font-bold">
                      <span className="text-[10px] text-slate-400 font-medium">Est. Build</span>
                      <span className="text-sm text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(module.basePriceUSD)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Proposal Calculator (1 Column Span) */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 sticky top-24">
            <div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
                Proposal Estimator
              </span>
              <h2 className="text-base font-bold text-white tracking-tight mt-1.5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Freelance Package Calculator</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure selected services to calculate milestones, timing budgets, and retainers.
              </p>
            </div>

            {/* Calculations metrics */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800 py-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Project Cost
                </span>
                <span className="text-lg font-extrabold text-white tracking-tight block">
                  {formatCurrency(totalCost)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Estimated Timeline
                </span>
                <span className="text-lg font-extrabold text-indigo-400 tracking-tight block">
                  {totalWeeks} {totalWeeks === 1 ? 'Week' : 'Weeks'}
                </span>
              </div>
            </div>

            {/* Monthly Retainer */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Support Retainer
                </span>
                <span className="text-xs text-slate-400">Updates, backup, bug-fixing</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white block">
                  {formatCurrency(monthlyRetainer)}
                </span>
                <span className="text-[10px] text-slate-400">/ month</span>
              </div>
            </div>

            {/* Selected Modules Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Selected Modules ({selectedIds.length})
              </h3>
              {selectedIds.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No modules selected. Select cards to calculate.</p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {SOFTWARE_MODULES.filter((m) => selectedIds.includes(m.id)).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between text-xs text-slate-300 bg-slate-800/60 p-2 rounded-lg border border-slate-800/50"
                    >
                      <span className="font-medium truncate mr-2">{m.name}</span>
                      <span className="text-slate-400 flex-shrink-0">{formatCurrency(m.basePriceUSD)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones Payment breakdown */}
            {selectedIds.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Standard Payment Milestones
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>50% Upfront Kickoff:</span>
                    <span className="font-semibold text-white">{formatCurrency(totalCost * 0.5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30% Release (UAT):</span>
                    <span className="font-semibold text-white">{formatCurrency(totalCost * 0.3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>20% Live Deployment:</span>
                    <span className="font-semibold text-white">{formatCurrency(totalCost * 0.2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              disabled={selectedIds.length === 0}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedIds.length === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Proposal Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Proposal Pitch Scope</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
