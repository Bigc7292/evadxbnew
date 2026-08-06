'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Share2,
  Star,
  Heart,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { cn, formatPrice, formatDualPrice } from '@/lib/utils';
import type { Property } from '@/lib/supabase/queries';

interface PropertyCardProps {
  property: Property;
  locale: string;
  index?: number;
}

const IMAGE_FALLBACK = '/placeholder-property.svg';

function stripMarkdownImages(text: string): string {
  return text.replace(/!\[\s*\]\([^)]+\)/g, '').replace(/\s+/g, ' ').trim();
}

export function PropertyCard({ property, locale, index }: PropertyCardProps) {
  const t = useTranslations('properties.card');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    if (imageError) return IMAGE_FALLBACK;
    const featured = property.featured_image || property.gallery_images?.[0];
    if (!featured) return IMAGE_FALLBACK;
    if (featured.toLowerCase().endsWith('.svg')) return IMAGE_FALLBACK;
    if (/logo/i.test(featured) && !/layout/i.test(featured)) return IMAGE_FALLBACK;
    return featured;
  }, [property.featured_image, property.gallery_images, imageError]);

  const displayPrice = useMemo(() => {
    const rawPrice = property.price;
    if (rawPrice == null) return null;
    return rawPrice;
  }, [property.price]);

  const priceLabel = useMemo(() => {
    if (!displayPrice) return 'Price on request';
    const currency = property.currency || 'USD';
    return formatDualPrice(displayPrice, currency);
  }, [displayPrice, property.currency]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: Math.min((index ?? 0) * 0.06, 0.6), duration: 0.5 }}
      className="group relative rounded-[1.5rem] overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={property.title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
          <Badge variant={property.status === 'ready' ? 'success' : 'luxury'}>
            {property.status === 'ready' ? t('available') : property.status.replace('_', ' ')}
          </Badge>
          {property.is_featured && (
            <Badge variant="luxury" className="shadow-lg shadow-accent/20">✨ {t('featured')}</Badge>
          )}
          {property.is_promoted && (
            <Badge variant="warning" className="shadow-lg shadow-yellow-500/20">🔥 {t('hot')}</Badge>
          )}
        </div>

        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted((prev) => !prev);
          }}
          className={cn(
            'absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 z-20 border',
            isWishlisted ? 'bg-accent/90 border-accent text-primary-foreground' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-5 h-5 transition-all', isWishlisted ? 'fill-current stroke-0' : 'stroke-2')} />
        </motion.button>

        <div className="absolute bottom-4 left-4 z-20">
          <Badge variant="outline" className="backdrop-blur-md bg-white/90 text-gray-900 border-white/60 hover:bg-accent/10 transition-colors shadow-sm">
            {property.property_type.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="truncate">{property.area || property.location || 'Dubai'}</span>
        </div>

        <Link href={`/${locale}/properties/${property.slug}`} className="block">
          <h3 className="font-heading text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        {property.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{stripMarkdownImages(property.short_description)}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/75">
          {property.bedrooms != null && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-accent">
              <Bed className="w-4 h-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-accent">
              <Bath className="w-4 h-4" />
              {property.bathrooms}
            </span>
          )}
          {property.area_sqft != null && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-accent">
              <Maximize className="w-4 h-4" />
              {property.area_sqft.toLocaleString()}
            </span>
          )}
        </div>

        {property.developer && (
          <div className="flex items-center gap-2 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {property.developer}
          </div>
        )}

        {property.payment_plan && (
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground/80 mb-1">Payment plan</p>
            <p>
              {property.payment_plan.down_payment}% down · {property.payment_plan.during_construction}% during construction · {property.payment_plan.on_handover}% on handover
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border/70 p-6">
        <div className="font-heading text-2xl font-bold gradient-gold">{priceLabel}</div>
        <Link href={`/${locale}/properties/${property.slug}`} className="shrink-0">
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
            {t('viewDetails')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
