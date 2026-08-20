'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Sliders,
  Database,
  Save,
  Check,
  Loader2,
  Palette,
  Sun,
  Moon,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState({
    developerName: 'Parth',
    agencyName: 'Velocity Software Studio',
    email: 'parth@velocitystudio.io',
    phone: '+91 98765 43210',
    whatsapp: '+919876543210',
    services: 'Modern High-Speed Websites, WhatsApp Automations, Custom CRMs, and Booking Engines',
    city: 'HSR Layout, Bangalore',
  });

  const [scoringWeights, setScoringWeights] = useState({
    noWebsiteBonus: 30,
    outdatedWebsiteBonus: 20,
    missingBookingBonus: 20,
    missingWhatsAppBonus: 15,
    highTicketIndustryBonus: 15,
    phoneAvailableBonus: 25,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          if (data.settings.profile) setProfile(data.settings.profile);
          if (data.settings.scoring_weights) setScoringWeights(data.settings.scoring_weights);
        }
      } catch (err) {
        console.error('Fetch settings failed:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          scoring_weights: scoringWeights,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error('Save settings failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto pb-16">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          <span>Application Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize developer agency profile, outreach messaging defaults, appearance, and opportunity scoring weights.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Appearance Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Palette className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Interface Appearance</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Theme Mode</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle between Sleek Dark Mode and Clean Light Mode.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${theme === 'light'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${theme === 'dark'
                    ? 'bg-slate-800 text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <User className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Developer & Agency Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Your Name</label>
              <input
                type="text"
                value={profile.developerName}
                onChange={(e) => setProfile({ ...profile, developerName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Agency / Studio Name</label>
              <input
                type="text"
                value={profile.agencyName}
                onChange={(e) => setProfile({ ...profile, agencyName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Contact Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Outreach Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Service Offerings Description</label>
              <input
                type="text"
                value={profile.services}
                onChange={(e) => setProfile({ ...profile, services: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">Default Target Territory</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Scoring Weights Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Opportunity Scoring Weights</h2>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Configure how heavily different heuristic signals contribute to the 0–100 Estimated Opportunity Score.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">No Website Listed</span>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400">+{scoringWeights.noWebsiteBonus} pts</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Outdated Website</span>
              <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">+{scoringWeights.outdatedWebsiteBonus} pts</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Missing Booking Engine</span>
              <div className="text-base font-bold text-purple-600 dark:text-purple-400">+{scoringWeights.missingBookingBonus} pts</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Missing WhatsApp Chat</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">+{scoringWeights.missingWhatsAppBonus} pts</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">High-Value Industry</span>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400">+{scoringWeights.highTicketIndustryBonus} pts</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Phone Reachable</span>
              <div className="text-base font-bold text-sky-600 dark:text-sky-400">+{scoringWeights.phoneAvailableBonus} pts</div>
            </div>
          </div>
        </div>

        {/* Legal & Data Source Attribution */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Compliance & Source Attribution</h2>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              • <strong>OpenStreetMap (OSM)</strong> & <strong>Overpass API</strong>: Map data and business node information is sourced under the Open Database License (ODbL).
            </p>
            <p>
              • <strong>Nominatim</strong>: Forward geocoding is cached and queries are rate-limited to respect public infrastructure limits.
            </p>
            <p>
              • <strong>Ethics & Privacy</strong>: Fast Pace does not scrape HTML from Google Maps, bypass CAPTCHA, or automate bulk spam. All outreach requires explicit human confirmation.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-4 h-4" />
              <span>Settings saved!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
