import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

interface Props {
  score: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LeadScoreBadge({ score, showIcon = false, size = 'sm' }: Props) {
  let color: string;

  if (score >= 85) {
    color = 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30';
  } else if (score >= 60) {
    color = 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-300 dark:border-blue-500/30';
  } else {
    color = 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/30';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border',
        sizeClasses[size],
        color
      )}
      title={`Lead Score: ${score}/100 based on verified contact info and local presence`}
    >
      {showIcon && <ShieldCheck className="w-3 h-3" />}
      <span>Lead {score}</span>
    </span>
  );
}
