import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Users,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      projects: true,
      lead: {
        include: { business: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalWonRevenue = clients.reduce((sum, c) => sum + c.totalBilled, 0);
  const activeProjectsCount = clients.reduce(
    (sum, c) => sum + c.projects.filter((p) => p.status !== 'COMPLETED').length,
    0
  );

  return (
    <div className="space-y-6  mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span>Clients & Project Delivery Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage closed clients, monitor software development milestones, and track ongoing maintenance retainers.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Signed Clients</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{clients.length}</div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Active Development Projects</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{activeProjectsCount}</div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Closed Won Client Revenue</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalWonRevenue)}
          </div>
        </div>
      </div>

      {/* Client List Cards */}
      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="p-12 bg-white dark:bg-[#111827]/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 shadow-sm">
            No active clients converted yet. Move leads to &ldquo;Won&rdquo; in the Kanban Pipeline or Lead 360 page to create client records.
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{client.businessName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold">
                      {client.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {client.industry} • Contact: {client.contactPerson || 'Business Owner'} •{' '}
                    {client.location || 'Bangalore'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Total Contract Value</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(client.totalBilled)}
                  </span>
                </div>
              </div>

              {/* Projects List for this Client */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Projects & Delivery Milestones
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {client.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">{proj.projectName}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold text-[10px]">
                          {proj.status}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">{proj.notes || 'In progress development'}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                        <span className="text-slate-500">
                          Deadline: {proj.deadline ? formatDate(proj.deadline) : '3 weeks'}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(proj.projectValue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  {client.phone && <span>📞 {client.phone}</span>}
                  {client.email && <span>✉️ {client.email}</span>}
                </div>
                {client.leadId && (
                  <Link
                    href={`/leads/${client.leadId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    View Lead 360 History &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
