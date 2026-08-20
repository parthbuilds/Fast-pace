import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Sparkles } from 'lucide-react';

interface Props {
  score: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OpportunityScoreBadge({ score, showIcon = true, size = 'sm' }: Props) {
  let color: string;
  let Icon = Sparkles;

  if (score >= 85) {
    color = 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-300 dark:border-rose-500/40';
    Icon = Flame;
  } else if (score >= 70) {
    color = 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-300 dark:border-amber-500/30';
    Icon = Sparkles;
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
        'inline-flex items-center gap-1 rounded-md border tracking-tight',
        sizeClasses[size],
        color
      )}
      title={`Estimated Opportunity Score: ${score}/100 based on software problem indicators`}
    >
      {showIcon && <Icon className="w-3 h-3 fill-current opacity-90" />}
      <span>Opp. {score}</span>
    </span>
  );
}
