import React from 'react';
import { cn, LEAD_STATUS_CONFIG } from '@/lib/utils';

interface Props {
  status: string;
  className?: string;
}

export function LeadStatusBadge({ status, className }: Props) {
  const config = LEAD_STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-tight',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}
