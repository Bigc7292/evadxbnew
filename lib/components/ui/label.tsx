'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Label = forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<'label'>>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = LabelPrimitive.Root.displayName;