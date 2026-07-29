'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;
DropdownMenu.displayName = DropdownMenuPrimitive.Root.displayName;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;
DropdownMenuGroup.displayName = DropdownMenuPrimitive.Group.displayName;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
DropdownMenuPortal.displayName = DropdownMenuPrimitive.Portal.displayName;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;
DropdownMenuSub.displayName = DropdownMenuPrimitive.Sub.displayName;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
DropdownMenuRadioGroup.displayName = DropdownMenuPrimitive.RadioGroup.displayName;

const DropdownMenuSubTrigger = DropdownMenuPrimitive.SubTrigger;
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = DropdownMenuPrimitive.SubContent;
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = DropdownMenuPrimitive.Content;
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = DropdownMenuPrimitive.Item;
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = DropdownMenuPrimitive.CheckboxItem;
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = DropdownMenuPrimitive.RadioItem;
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = DropdownMenuPrimitive.Label;
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};