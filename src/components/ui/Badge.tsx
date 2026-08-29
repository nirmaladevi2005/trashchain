import * as React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2",
        {
          'bg-neutral-100 text-neutral-900': variant === 'default',
          'bg-fresh-100 text-fresh-800': variant === 'success',
          'bg-amber-100 text-amber-800': variant === 'warning',
          'bg-coral-100 text-coral-800': variant === 'danger',
          'border border-neutral-200 text-neutral-950': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
