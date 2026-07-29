'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'luxury' | 'success' | 'warning' | 'destructive' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/10 text-primary border border-primary/20',
      luxury: 'bg-gradient-gold text-primary border-none',
      success: 'bg-green-500/10 text-green-500 border border-green-500/20',
      warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      destructive: 'bg-red-500/10 text-red-500 border border-red-500/20',
      outline: 'border border-border bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';