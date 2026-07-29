'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = TabsPrimitive.List;
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = TabsPrimitive.Trigger;
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = TabsPrimitive.Content;
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };