import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}


export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  emoji?: string;
}

export const LEAD_STATUS_CONFIG: Record<string, StatusConfig> = {
  NEW: {
    label: 'New Lead',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-500/30',
    emoji: '🆕',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-500/30',
    emoji: '📞',
  },
  WHATSAPP_SENT: {
    label: 'WhatsApp Sent',
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-500/30',
    emoji: '💬',
  },
  CALLED: {
    label: 'Called',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-500/30',
    emoji: '📲',
  },
  INTERESTED: {
    label: 'Interested',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/30',
    emoji: '⭐',
  },
  MEETING_SCHEDULED: {
    label: 'Meeting Set',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-500/30',
    emoji: '📅',
  },
  PROPOSAL_SENT: {
    label: 'Proposal Sent',
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-700 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-500/30',
    emoji: '📋',
  },
  NEGOTIATING: {
    label: 'Negotiating',
    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-500/30',
    emoji: '🤝',
  },
  WON: {
    label: 'Won 🎉',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    emoji: '🏆',
  },
  LOST: {
    label: 'Lost',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-500/30',
    emoji: '❌',
  },
  DO_NOT_CONTACT: {
    label: 'DNC',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    emoji: '🚫',
  },
  NO_INTEREST: {
    label: 'No Interest',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    emoji: '👎',
  },
  FOLLOW_UP_SCHEDULED: {
    label: 'Follow Up',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-500/30',
    emoji: '🔔',
  },
};
