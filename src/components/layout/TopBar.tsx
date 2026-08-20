'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Download,
  PhoneCall,
  Zap,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function TopBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleExportAll = () => {
    window.location.href = '/api/export/excel';
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-20 flex items-center justify-between px-6 transition-colors">
      {/* Left Search input */}
      <form onSubmit={handleSearch} className="relative w-96 max-w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search leads, phone numbers, categories, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </form>

      {/* Right Quick Action Buttons */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />

        <Link
          href="/outreach"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Outreach Queue</span>
        </Link>

        <button
          onClick={handleExportAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          title="Export all database tables into formatted Excel sheets"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Excel Export</span>
        </button>

        <Link
          href="/finder"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Find Businesses</span>
        </Link>
      </div>
    </header>
  );
}
