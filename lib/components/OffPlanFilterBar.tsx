'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, BedDouble, Home, MapPin, Wallet } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { cn } from '@/lib/utils';

const LOCATIONS = [
  'Dubai',
  'Palm Jumeirah',
  'Downtown Dubai',
  'Dubai Marina',
  'Business Bay',
  'Dubai Hills Estate',
  'City Walk',
  'Dubai Investment Park',
  'Palm Jebel Ali',
  'The Valley',
  'Jumeirah Village',
  'Ras Al Khor',
  'Al Marjan Island',
];

const PROPERTY_TYPES = [
  'apartment',
  'villa',
  'townhouse',
  'penthouse',
  'studio',
  'commercial',
  'land',
];

const BEDROOMS = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

interface OffPlanFilterBarProps {
  totalCount: number;
}

export function OffPlanFilterBar({ totalCount }: OffPlanFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const location = searchParams.get('location') || '';
  const propertyType = searchParams.get('property_type') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const query = searchParams.get('q') || '';

  const activeFilterCount = [location, propertyType, bedrooms, minPrice, maxPrice, query].filter(Boolean).length;

  const updateParams = useMemo(() => {
    const createURL = (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return `${pathname}?${params.toString()}`;
    };
    return createURL;
  }, [pathname, searchParams]);

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold gradient-gold">Off-Plan Properties</h2>
          <p className="text-muted-foreground mt-1">
            {totalCount > 0
              ? `${totalCount} ${totalCount === 1 ? 'property' : 'properties'} available`
              : 'Explore premium off-plan properties in Dubai'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              defaultValue={query}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  router.push(updateParams({ q: null }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  router.push(updateParams({ q: value || null }));
                }
              }}
              className="pl-9 w-64"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(updateParams({}))}
            className={cn('gap-2 rounded-xl border-border/70', activeFilterCount > 0 && 'border-accent text-accent')}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <Badge variant="success" className="ml-1">{activeFilterCount}</Badge>}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {location && (
                    <FilterChip label={`Location: ${location}`} onClear={() => router.push(updateParams({ location: null }))} />
                  )}
                  {propertyType && (
                    <FilterChip label={`Type: ${propertyType}`} onClear={() => router.push(updateParams({ property_type: null }))} />
                  )}
                  {bedrooms && (
                    <FilterChip label={`${bedrooms}+ beds`} onClear={() => router.push(updateParams({ bedrooms: null }))} />
                  )}
                  {minPrice && (
                    <FilterChip label={`From AED ${Number(minPrice).toLocaleString()}`} onClear={() => router.push(updateParams({ min_price: null }))} />
                  )}
                  {maxPrice && (
                    <FilterChip label={`To AED ${Number(maxPrice).toLocaleString()}`} onClear={() => router.push(updateParams({ max_price: null }))} />
                  )}
                  {query && (
                    <FilterChip label={`"${query}"`} onClear={() => router.push(updateParams({ q: null }))} />
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive/80">
                  <X className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Select value={location} onValueChange={(value) => router.push(updateParams({ location: value || null }))}>
              <SelectTrigger className="pl-9 rounded-xl border-border/70">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All locations</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Select value={propertyType} onValueChange={(value) => router.push(updateParams({ property_type: value || null }))}>
              <SelectTrigger className="pl-9 rounded-xl border-border/70">
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Select value={bedrooms} onValueChange={(value) => router.push(updateParams({ bedrooms: value || null }))}>
              <SelectTrigger className="pl-9 rounded-xl border-border/70">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any bedrooms</SelectItem>
                {BEDROOMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Max price (AED)"
              type="number"
              value={maxPrice}
              onChange={(e) => router.push(updateParams({ max_price: e.target.value || null }))}
              className="pl-9 rounded-xl border-border/70"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent border border-accent/20 px-3 py-1 text-xs font-medium">
      {label}
      <button onClick={onClear} className="hover:text-destructive transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
