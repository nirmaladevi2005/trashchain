import * as React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none",
          {
            'bg-forest-600 text-white hover:bg-forest-700 shadow-md hover:shadow-forest-600/25': variant === 'primary',
            'bg-fresh-100 text-fresh-900 hover:bg-fresh-200 hover:text-fresh-950': variant === 'secondary',
            'border-2 border-neutral-200 bg-white/50 hover:bg-white text-neutral-900 shadow-sm hover:border-neutral-300': variant === 'outline',
            'hover:bg-neutral-100/80 hover:text-neutral-900 text-neutral-600': variant === 'ghost',
            'bg-coral-500 text-white hover:bg-coral-600 shadow-md hover:shadow-coral-500/25': variant === 'danger',
            'h-9 px-4 text-xs': size === 'sm',
            'h-11 px-6 text-sm': size === 'md',
            'h-14 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
