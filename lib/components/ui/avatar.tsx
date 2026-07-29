'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = AvatarPrimitive.Root;
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = AvatarPrimitive.Image;
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = AvatarPrimitive.Fallback;
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };