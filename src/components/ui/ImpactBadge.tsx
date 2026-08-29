import * as React from 'react';
import { cn } from '../../utils/cn';
import { Sparkles, ShieldCheck, Scale, Eye, HelpCircle, Users } from 'lucide-react';
import type { ImpactType } from '../../types';

export interface ImpactBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type: ImpactType | 'PROJECTED' | 'VERIFIED' | 'ESTIMATED' | 'MEASURED' | 'USER-REPORTED' | 'TEST DATA' | 'TRASHCHAIN VERIFIED' | 'INDEPENDENTLY VERIFIED';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BADGE_CONFIG: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }>; tooltip: string }> = {
  projected: {
    label: 'PROJECTED',
    className: 'bg-purple-100 text-purple-800 border-purple-200 ring-1 ring-purple-300/50',
    icon: Sparkles,
    tooltip: 'AI or model-based estimate before intervention. Not verified field data.'
  },
  verified: {
    label: 'VERIFIED',
    className: 'bg-fresh-100 text-fresh-900 border-fresh-300 ring-1 ring-fresh-400/50 font-bold',
    icon: ShieldCheck,
    tooltip: 'Confirmed environmental impact verified through field evidence and GPS timestamps.'
  },
  estimated: {
    label: 'ESTIMATED',
    className: 'bg-blue-100 text-blue-800 border-blue-200 ring-1 ring-blue-300/50',
    icon: Eye,
    tooltip: 'User visual or count-based estimate. Not weighed on a calibrated scale.'
  },
  measured: {
    label: 'MEASURED',
    className: 'bg-forest-100 text-forest-900 border-forest-300 ring-1 ring-forest-400/50 font-bold',
    icon: Scale,
    tooltip: 'Weighed on a scale or directly quantified with standardized measurement units.'
  },
  'user-reported': {
    label: 'USER-REPORTED',
    className: 'bg-neutral-100 text-neutral-800 border-neutral-300 ring-1 ring-neutral-300/50',
    icon: Users,
    tooltip: 'Observation submitted by community volunteer in the field.'
  },
  user_reported: {
    label: 'USER-REPORTED',
    className: 'bg-neutral-100 text-neutral-800 border-neutral-300 ring-1 ring-neutral-300/50',
    icon: Users,
    tooltip: 'Observation submitted by community volunteer in the field.'
  },
  'test-data': {
    label: 'TEST DATA',
    className: 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/50 font-mono font-bold',
    icon: Sparkles,
    tooltip: 'Synthetic test record created during automated smoke testing. Excluded from real impact analytics.'
  },
  test_data: {
    label: 'TEST DATA',
    className: 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/50 font-mono font-bold',
    icon: Sparkles,
    tooltip: 'Synthetic test record created during automated smoke testing. Excluded from real impact analytics.'
  },
  'trashchain-verified': {
    label: 'TRASHCHAIN VERIFIED',
    className: 'bg-fresh-100 text-fresh-900 border-fresh-300 ring-1 ring-fresh-400/50 font-bold',
    icon: ShieldCheck,
    tooltip: 'Verified via TrashChain field protocol and GPS timestamps. Not independently audited.'
  },
  trashchain_verified: {
    label: 'TRASHCHAIN VERIFIED',
    className: 'bg-fresh-100 text-fresh-900 border-fresh-300 ring-1 ring-fresh-400/50 font-bold',
    icon: ShieldCheck,
    tooltip: 'Verified via TrashChain field protocol and GPS timestamps. Not independently audited.'
  },
  'independently-verified': {
    label: 'INDEPENDENTLY VERIFIED',
    className: 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-1 ring-emerald-500/50 font-bold',
    icon: ShieldCheck,
    tooltip: 'Audited and verified by third-party municipal or environmental auditor.'
  },
  independently_verified: {
    label: 'INDEPENDENTLY VERIFIED',
    className: 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-1 ring-emerald-500/50 font-bold',
    icon: ShieldCheck,
    tooltip: 'Audited and verified by third-party municipal or environmental auditor.'
  }
};

export function ImpactBadge({ type, showIcon = true, size = 'sm', className, ...props }: ImpactBadgeProps) {
  const normalizedType = type.toLowerCase().replace('_', '-');
  const config = BADGE_CONFIG[normalizedType] || BADGE_CONFIG['user-reported'];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono font-semibold tracking-wider transition-all select-none cursor-help",
        config.className,
        {
          'text-[10px] px-2 py-0.5': size === 'sm',
          'text-xs px-2.5 py-1': size === 'md',
          'text-sm px-3 py-1.5': size === 'lg',
        },
        className
      )}
      title={config.tooltip}
      {...props}
    >
      {showIcon && <Icon className={cn("shrink-0", size === 'sm' ? "w-3 h-3" : size === 'md' ? "w-3.5 h-3.5" : "w-4 h-4")} />}
      <span>{config.label}</span>
      <HelpCircle className="w-2.5 h-2.5 opacity-50 ml-0.5 inline shrink-0" />
    </div>
  );
}
