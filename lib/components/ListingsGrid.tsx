'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Search, ChevronDown, Globe, Heart, MapPin, LayoutGrid, List, Filter, X, Bed, Bath, Maximize, Share2, Star, Menu, X as CloseIcon } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { cn, formatPrice } from '@/lib/utils';
import type { Property } from '@/lib/supabase/queries';
import { PropertyCard } from './PropertyCard';
import { useState } from 'react';

interface ListingsGridProps {
  properties: Property[];
  locale: string;
  loading?: boolean;
  totalCount?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  filters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
}

export function ListingsGrid({
  properties,
  locale,
  loading = false,
  totalCount,
  hasMore = false,
  onLoadMore,
  filters = {},
  onFiltersChange,
}: ListingsGridProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [bedrooms, setBedrooms] = useState<string>('');

  const propertyTypes = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'commercial', 'land'];
  const locations = ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Palm Jumeirah', 'Jumeirah Village', 'Dubai Hills', 'The Valley', 'City Walk', 'Dubai Investment Park', 'Palm Jebel Ali'];

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange?.({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedLocation('');
    setPriceRange([0, 5000000]);
    setBedrooms('');
    onFiltersChange?.({});
  };

  const hasActiveFilters = searchQuery || selectedType || selectedLocation || priceRange[0] > 0 || priceRange[1] < 5000000 || bedrooms;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h2 className="font-heading text-3xl font-bold gradient-gold">{t('subtitle')}</h2>
          <p className="text-muted-foreground mt-1">{totalCount ? t('resultsFound', { count: totalCount }) : t('resultsShowing', { count: properties.length })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted/80 rounded-2xl p-1 border border-border/60">
            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-xl transition-colors', viewMode === 'grid' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')} aria-label="Grid view">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-xl transition-colors', viewMode === 'list' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')} aria-label="List view">
              <List className="w-5 h-5" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={cn('gap-2 rounded-xl border-border/70', hasActiveFilters && 'border-accent text-accent')}>
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filters.title')}</span>
            {hasActiveFilters && <Badge variant="success" className="ml-1">{Object.keys(filters).length}</Badge>}
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: showFilters ? 1 : 0, height: showFilters ? 'auto' : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('filters.search')} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange('search', e.target.value); }} className="pl-10 rounded-xl border-border/70" />
            </div>
            <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); handleFilterChange('property_type', v); }}>
              <SelectTrigger className="rounded-xl border-border/70"><SelectValue placeholder={t('filters.propertyType')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('filters.allTypes')}</SelectItem>
                {propertyTypes.map(type => (<SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={(v) => { setSelectedLocation(v); handleFilterChange('location', v); }}>
              <SelectTrigger className="rounded-xl border-border/70"><SelectValue placeholder={t('filters.location')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('filters.allLocations')}</SelectItem>
                {locations.map(loc => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={bedrooms} onValueChange={(v) => { setBedrooms(v); handleFilterChange('bedrooms', v); }}>
              <SelectTrigger className="rounded-xl border-border/70"><SelectValue placeholder={t('filters.bedrooms')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('filters.anyBeds')}</SelectItem>
                {[1, 2, 3, 4, 5].map(b => (<SelectItem key={b} value={b.toString()}>{b}+ {tCommon('bedrooms')}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">{t('filters.priceRange')}</label>
            <div className="flex items-center gap-4">
              <input type="range" min="0" max="5000000" step="100000" value={priceRange[0]} onChange={(e) => { const val = parseInt(e.target.value); setPriceRange([Math.min(val, priceRange[1] - 100000), priceRange[1]]); handleFilterChange('price_min', Math.min(val, priceRange[1] - 100000)); }} className="flex-1 h-2 bg-accent/20 rounded-full appearance-none accent-accent cursor-pointer" />
              <input type="range" min="0" max="5000000" step="100000" value={priceRange[1]} onChange={(e) => { const val = parseInt(e.target.value); setPriceRange([priceRange[0], Math.max(val, priceRange[0] + 100000)]); handleFilterChange('price_max', Math.max(val, priceRange[0] + 100000)); }} className="flex-1 h-2 bg-accent/20 rounded-full appearance-none accent-accent cursor-pointer" />
              <div className="w-32 text-right text-sm font-medium gradient-gold">{priceRange[1] >= 5000000 ? 'AED 5M+' : `${(priceRange[1] / 1000000).toFixed(1)}M`}</div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>AED 0</span><span>AED 5M+</span></div>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive/80 rounded-xl"><CloseIcon className="w-4 h-4 mr-2" />{t('filters.reset')}</Button>
          )}
        </div>
      </motion.div>

      <motion.div layout className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4')}>
        {properties.map((property, index) => (
          <PropertyCard key={property.id} property={property} locale={locale} index={index} />
        ))}

        {loading && properties.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {properties.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-full text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"><Search className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="font-heading text-xl font-semibold mb-2">{t('grid.noResults')}</h3>
            <p className="text-muted-foreground mb-6">{t('grid.noResultsDesc')}</p>
            <Button variant="outline" onClick={clearFilters} className="rounded-xl border-border/70">{t('filters.reset')}</Button>
          </motion.div>
        )}
      </motion.div>

      {hasMore && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <Button variant="outline" size="lg" onClick={onLoadMore} className="w-full sm:w-auto rounded-xl border-border/70">{t('grid.loadMore')}</Button>
        </motion.div>
      )}
    </div>
  );
}
