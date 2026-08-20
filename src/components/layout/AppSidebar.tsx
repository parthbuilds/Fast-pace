'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Database,
  ScanEye,
  Send,
  CalendarClock,
  Kanban,
  FileQuestion,
  FileText,
  Users,
  Settings,
  Zap,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Lead Finder', href: '/finder', icon: Compass, badge: 'Live OSM' },
  { label: 'Lead Database', href: '/leads', icon: Database },
  { label: 'Opportunities', href: '/opportunities', icon: Zap },
  { label: 'Digital Audit', href: '/audit', icon: ScanEye },
  { label: 'Outreach Hub', href: '/outreach', icon: Send },
  { label: 'Follow Ups', href: '/follow-ups', icon: CalendarClock },
  { label: 'Sales Pipeline', href: '/pipeline', icon: Kanban },
  { label: 'Client Discovery', href: '/discovery', icon: FileQuestion },
  { label: 'Services & Pricing', href: '/services', icon: Sparkles },
  { label: 'Proposal Builder', href: '/proposals', icon: FileText },
  { label: 'Clients & Projects', href: '/clients', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30 transition-colors">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">Fast Pace</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 dark:border-blue-500/30">
                OS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Local Sales Machine</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
              P
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">Parth (Full-Stack)</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Bangalore (HSR)</span>
              </div>
            </div>
          </div>
          <Link
            href="/settings"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
