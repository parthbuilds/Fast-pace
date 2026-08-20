import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { OpportunityScoreBadge } from '@/components/leads/OpportunityScoreBadge';

export const dynamic = 'force-dynamic';

export default async function FollowUpsPage() {
  const followUps = await prisma.followUp.findMany({
    include: {
      lead: {
        include: {
          business: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const overdue = followUps.filter(
    (f) => f.status === 'PENDING' && new Date(f.dueDate) < todayStart
  );
  const dueToday = followUps.filter(
    (f) =>
      f.status === 'PENDING' &&
      new Date(f.dueDate) >= todayStart &&
      new Date(f.dueDate) < tomorrowStart
  );
  const upcoming = followUps.filter(
    (f) => f.status === 'PENDING' && new Date(f.dueDate) >= tomorrowStart
  );
  const completed = followUps.filter((f) => f.status === 'COMPLETED');

  return (
    <div className="space-y-6  mx-auto pb-12">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-blue-500" />
          <span>Follow-Up Reminders & Scheduled Calls</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Never let a warm prospect drop. Track client follow-ups across stages from initial outreach to proposal negotiation.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Follow-ups Due Today</span>
          <div className="text-2xl font-bold text-amber-500 mt-1">{dueToday.length}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Overdue Reminders</span>
          <div className="text-2xl font-bold text-rose-500 mt-1">{overdue.length}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Upcoming Scheduled</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{upcoming.length}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Completed</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completed.length}</div>
        </div>
      </div>

      {/* Due Today & Overdue Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Due Today & Immediate Follow-ups ({dueToday.length + overdue.length})</span>
        </h2>

        {dueToday.length + overdue.length === 0 ? (
          <div className="p-8 bg-white dark:bg-[#111827]/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 shadow-sm">
            No follow-ups due today. You are all caught up!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...overdue, ...dueToday].map((item) => {
              const isOverdue = new Date(item.dueDate) < todayStart;
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between shadow-sm ${isOverdue
                      ? 'bg-rose-50 dark:bg-rose-950/15 border-rose-200 dark:border-rose-500/30'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'
                    }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/leads/${item.leadId}`}
                          className="font-bold text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors block"
                        >
                          {item.lead.business.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.lead.business.category} • {item.lead.business.address || 'Bangalore'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isOverdue
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                            }`}
                        >
                          {isOverdue ? 'Overdue' : 'Due Today'}
                        </span>
                        <OpportunityScoreBadge score={item.lead.opportunityScore} />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Reason:</span>
                      <p className="text-slate-600 dark:text-slate-400">{item.reason}</p>
                      {item.notes && (
                        <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800 mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {item.lead.business.phone || 'No phone'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/leads/${item.leadId}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                      >
                        Action Lead 360 &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-500" />
          <span>Upcoming Scheduled Follow-ups ({upcoming.length})</span>
        </h2>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-4">Reason / Plan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {upcoming.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-200">
                      <Link
                        href={`/leads/${item.leadId}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {item.lead.business.name}
                      </Link>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block">
                        {item.lead.business.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(item.dueDate)} ({formatRelativeTime(item.dueDate)})
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{item.reason}</td>
                    <td className="py-3.5 px-3">
                      <LeadStatusBadge status={item.lead.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/leads/${item.leadId}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-[11px] font-semibold transition-colors"
                      >
                        Open 360 &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
