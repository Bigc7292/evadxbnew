'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'luxury' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    
    const variants: Record<ButtonVariant, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2',
      luxury: 'bg-gradient-gold text-primary hover:opacity-90 h-11 px-6 py-2.5 font-heading text-lg shadow-lg hover:shadow-xl',
      outline: 'border border-primary bg-transparent hover:bg-primary/10 h-10 px-4 py-2',
      ghost: 'bg-transparent hover:bg-accent h-10 px-4 py-2',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2',
      link: 'text-primary underline-offset-4 hover:underline h-10 px-2 py-2',
    };
    
    const sizes: Record<ButtonSize, string> = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-9 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8 text-base',
      xl: 'h-12 rounded-lg px-10 text-lg',
      icon: 'h-10 w-10',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';