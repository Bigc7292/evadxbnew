'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Search, ChevronDown, Globe, Heart, MapPin, LayoutGrid, List, Filter, X, Bed, Bath, Maximize, Share2, Star, Menu, X as CloseIcon, Home, Hotel } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { cn, formatPrice } from '@/lib/utils';
import type { Property } from '@/lib/supabase/queries';
import { PropertyCard } from './PropertyCard';
import { useState, useMemo, useEffect, useRef } from 'react';

interface ListingsGridProps {
  properties: Property[];
  locale: string;
  loading?: boolean;
  totalCount?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  filters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  defaultFilters?: Record<string, any>;
  disableFilters?: boolean;
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
  defaultFilters = {},
  disableFilters = false,
}: ListingsGridProps) {
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [selectedType, setSelectedType] = useState(filters?.property_type || '');
  const [selectedLocation, setSelectedLocation] = useState(filters?.location || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    typeof filters?.priceRange?.[0] === 'number' ? filters.priceRange[0] : 0,
    typeof filters?.priceRange?.[1] === 'number' ? filters.priceRange[1] : 5000000,
  ]);
  const [bedrooms, setBedrooms] = useState<string>(filters?.bedrooms ? String(filters.bedrooms) : '');
  const [listingType, setListingType] = useState<'sale' | 'rent' | ''>(filters?.listing_type || '');
  const [areaRange, setAreaRange] = useState<[number, number]>([
    typeof filters?.min_area === 'number' ? filters.min_area : 0,
    typeof filters?.max_area === 'number' ? filters.max_area : 10000,
  ]);

  const propertyTypes = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'commercial', 'land'];
  const locations = ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Palm Jumeirah', 'Jumeirah Village', 'Dubai Hills', 'The Valley', 'City Walk', 'Dubai Investment Park', 'Palm Jebel Ali'];
  const areaRanges = [
    { label: 'Any Size', min: undefined, max: undefined },
    { label: '< 500 sqft', min: 0, max: 500 },
    { label: '500 - 1,000 sqft', min: 500, max: 1000 },
    { label: '1,000 - 2,000 sqft', min: 1000, max: 2000 },
    { label: '2,000 - 5,000 sqft', min: 2000, max: 5000 },
    { label: '5,000+ sqft', min: 5000, max: undefined },
  ];

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    setSearchQuery(filters?.search || '');
    setSelectedType(filters?.property_type || '');
    setSelectedLocation(filters?.location || '');
    setListingType(filters?.listing_type || '');
    setBedrooms(filters?.bedrooms ? String(filters.bedrooms) : '');
    setPriceRange([
      typeof filters?.priceRange?.[0] === 'number' ? filters.priceRange[0] : 0,
      typeof filters?.priceRange?.[1] === 'number' ? filters.priceRange[1] : 5000000,
    ]);
    setAreaRange([
      typeof filters?.min_area === 'number' ? filters.min_area : 0,
      typeof filters?.max_area === 'number' ? filters.max_area : 10000,
    ]);
  }, [filtersKey]);

  const filteredProperties = useMemo(() => {
    if (disableFilters) {
      return properties;
    }
    return properties.filter((property) => {
      if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) && !property.location.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedType && property.property_type !== selectedType) {
        return false;
      }
      if (selectedLocation && property.location !== selectedLocation) {
        return false;
      }
      if (listingType && property.price_type !== listingType) {
        return false;
      }
      if (bedrooms && property.bedrooms !== parseInt(bedrooms)) {
        return false;
      }
      if (property.price && (property.price < priceRange[0] || property.price > priceRange[1])) {
        return false;
      }
      if (property.area_sqft && (property.area_sqft < areaRange[0] || property.area_sqft > areaRange[1])) {
        return false;
      }
      return true;
    });
  }, [properties, searchQuery, selectedType, selectedLocation, listingType, bedrooms, priceRange, areaRange, disableFilters]);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange?.({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedLocation('');
    setPriceRange([0, 5000000]);
    setBedrooms('');
    setListingType('');
    setAreaRange([0, 10000]);
    onFiltersChange?.({});
  };

  const hasActiveFilters = searchQuery || selectedType || selectedLocation || listingType || priceRange[0] > 0 || priceRange[1] < 5000000 || bedrooms || areaRange[0] > 0 || areaRange[1] < 10000;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h2 className="font-heading text-3xl font-bold gradient-gold">{t('subtitle')}</h2>
          <p className="text-muted-foreground mt-1">{filteredProperties.length > 0 ? t('resultsFound', { count: filteredProperties.length }) : t('resultsShowing', { count: filteredProperties.length })}</p>
        </div>
        {!disableFilters && (
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
              {hasActiveFilters && <Badge variant="success" className="ml-1">{Object.keys(filters).length + (listingType ? 1 : 0)}</Badge>}
            </Button>
          </div>
        )}
      </div>

      {!disableFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: showFilters ? 1 : 0, height: showFilters ? 'auto' : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
          <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={t('filters.search')} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange('search', e.target.value); }} className="pl-10 rounded-xl border-border/70" />
              </div>
               <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); handleFilterChange('property_type', v); }}>
                 <SelectTrigger className="rounded-xl border-border/70"><SelectValue placeholder={t('filters.propertyType')} /></SelectTrigger>
                 <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                   <SelectItem value="">{t('filters.allTypes')}</SelectItem>
                   {propertyTypes.map(type => (<SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>))}
                 </SelectContent>
               </Select>
               <Select value={selectedLocation} onValueChange={(v) => { setSelectedLocation(v); handleFilterChange('location', v); }}>
                 <SelectTrigger className="rounded-xl border-border/70"><SelectValue placeholder={t('filters.location')} /></SelectTrigger>
                 <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                   <SelectItem value="">{t('filters.allLocations')}</SelectItem>
                   {locations.map(loc => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
                 </SelectContent>
               </Select>
               <Select value={bedrooms} onValueChange={(v) => { setBedrooms(v); handleFilterChange('bedrooms', v); }}>
                 <SelectTrigger className="rounded-xl border-border/70"><SelectValue placeholder={t('filters.bedrooms')} /></SelectTrigger>
                 <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                   <SelectItem value="">{t('filters.anyBeds')}</SelectItem>
                   {[1, 2, 3, 4, 5, 6, 7].map(b => (<SelectItem key={b} value={b.toString()}>{b}+ {tCommon('bedrooms')}</SelectItem>))}
                 </SelectContent>
               </Select>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-3">{t('filters.priceRange') || 'Price Range'}</label>
               <div className="flex items-center gap-4">
                 <input type="range" min="0" max="5000000" step="100000" value={priceRange[0]} onChange={(e) => { const val = parseInt(e.target.value); setPriceRange([Math.min(val, priceRange[1] - 100000), priceRange[1]]); handleFilterChange('price_min', Math.min(val, priceRange[1] - 100000)); }} className="flex-1 h-2 bg-accent/20 rounded-full appearance-none accent-accent cursor-pointer" />
                 <input type="range" min="0" max="5000000" step="100000" value={priceRange[1]} onChange={(e) => { const val = parseInt(e.target.value); setPriceRange([priceRange[0], Math.max(val, priceRange[0] + 100000)]); handleFilterChange('price_max', Math.max(val, priceRange[0] + 100000)); }} className="flex-1 h-2 bg-accent/20 rounded-full appearance-none accent-accent cursor-pointer" />
                 <div className="w-32 text-right text-sm font-medium gradient-gold">{priceRange[1] >= 5000000 ? 'AED 5M+' : `${(priceRange[1] / 1000000).toFixed(1)}M`}</div>
               </div>
               <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>AED 0</span><span>AED 5M+</span></div>
             </div>
             <div>
               <label className="block text-sm font-medium mb-3">{t('filters.listingType') || 'Listing Type'}</label>
               <div className="flex bg-muted/80 rounded-2xl p-1 border border-border/60">
                 <button onClick={() => { setListingType(listingType === 'sale' ? '' : 'sale'); handleFilterChange('listing_type', listingType === 'sale' ? '' : 'sale'); }} className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all', listingType === 'sale' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}>
                   <Home className="w-4 h-4" />
                   {t('filters.purchase') || 'Purchase'}
                 </button>
                 <button onClick={() => { setListingType(listingType === 'rent' ? '' : 'rent'); handleFilterChange('listing_type', listingType === 'rent' ? '' : 'rent'); }} className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all', listingType === 'rent' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}>
                   <Hotel className="w-4 h-4" />
                   {t('filters.rent') || 'Rent'}
                 </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">{t('filters.propertySize') || 'Property Size'}</label>
                <Select
                  value={areaRange[0] === 0 && areaRange[1] === 10000 ? '' : `${areaRange[0]}-${areaRange[1]}`}
                  onValueChange={(v) => {
                    const selected = areaRanges.find((r) => `${r.min}-${r.max}` === v);
                    if (selected) {
                      const next: [number, number] = [
                        selected.min ?? 0,
                        selected.max ?? 10000,
                      ];
                      setAreaRange(next);
                      handleFilterChange('min_area', selected.min ?? undefined);
                      handleFilterChange('max_area', selected.max ?? undefined);
                    } else {
                      setAreaRange([0, 10000]);
                      handleFilterChange('min_area', undefined);
                      handleFilterChange('max_area', undefined);
                    }
                  }}
                >
                  <SelectTrigger className="rounded-xl border-border/70">
                    <SelectValue placeholder={t('filters.anySize') || 'Any Size'} />
                  </SelectTrigger>
                  <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                    <SelectItem value="">{t('filters.anySize') || 'Any Size'}</SelectItem>
                    {areaRanges.filter((r) => r.min !== undefined || r.max !== undefined).map((r) => (
                      <SelectItem key={`${r.min}-${r.max}`} value={`${r.min}-${r.max}`}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive/80 rounded-xl"><CloseIcon className="w-4 h-4 mr-2" />{t('filters.reset')}</Button>
            )}
          </div>
        </motion.div>
      )}

      <motion.div layout className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4')}>
        {filteredProperties.map((property, index) => (
          <PropertyCard key={property.id} property={property} locale={locale} index={index} />
        ))}

        {loading && properties.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {filteredProperties.length === 0 && !loading && (
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
