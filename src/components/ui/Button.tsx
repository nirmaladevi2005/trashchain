import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.025, y: -1 }}
        whileTap={{ scale: 0.975 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none",
          {
            'bg-forest-700 hover:bg-forest-800 text-white shadow-sm hover:shadow-forest-700/20': variant === 'primary',
            'bg-fresh-500/10 text-fresh-700 dark:text-fresh-300 hover:bg-fresh-500/20 border border-fresh-500/30': variant === 'secondary',
            'border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm': variant === 'outline',
            'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300': variant === 'ghost',
            'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-rose-600/20': variant === 'danger',
            'h-9 px-4 text-xs': size === 'sm',
            'h-11 px-6 text-sm': size === 'md',
            'h-13 px-7 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
