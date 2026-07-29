'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

const ScrollArea = ScrollAreaPrimitive.Root;
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = ScrollAreaPrimitive.ScrollAreaScrollbar;
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

const ScrollAreaViewport = ScrollAreaPrimitive.Viewport;
ScrollAreaViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;