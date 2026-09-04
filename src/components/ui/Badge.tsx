import * as React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'purple' | 'info';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 select-none",
        {
          'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700': variant === 'default',
          'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30': variant === 'success',
          'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30': variant === 'warning',
          'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30': variant === 'danger',
          'bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-500/30': variant === 'purple',
          'bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/30': variant === 'info',
          'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white/50 dark:bg-neutral-900/50': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
