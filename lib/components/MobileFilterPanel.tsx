'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, MapPin, Home, BedDouble, Bath, Square, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { cn } from '@/lib/utils';
import { FilterAccordion } from './FilterAccordion';

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

const BATHROOMS = [
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const FURNISHING_OPTIONS = [
  { value: 'Furnished', label: 'Furnished' },
  { value: 'Semi furnished', label: 'Semi furnished' },
  { value: 'Unfurnished', label: 'Unfurnished' },
];

const TENANCY_OPTIONS = [
  { value: 'Tenanted', label: 'Tenanted' },
  { value: 'Vacant', label: 'Vacant' },
];

const VIEW_OPTIONS = [
  'Sea View',
  'City View',
  'Community View',
  'Pool View',
  'Garden View',
  'Golf View',
  'Burj Khalifa View',
  'Palm View',
  'Waterfront',
  'Park View',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area', label: 'Largest Area' },
];

const AREA_RANGES = [
  { value: '', label: 'Any Size' },
  { value: '500', label: '< 500 sqft' },
  { value: '1000', label: '500 - 1,000 sqft' },
  { value: '2000', label: '1,000 - 2,000 sqft' },
  { value: '5000', label: '2,000 - 5,000 sqft' },
  { value: '10000', label: '5,000+ sqft' },
];

interface MobileFilterPanelProps {
  basePath: string;
  defaultQuery?: Record<string, string | undefined>;
  onResultsChange?: (count: number) => void;
  children?: React.ReactNode;
}

export function MobileFilterPanel({ basePath, defaultQuery = {}, onResultsChange, children }: MobileFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const location = searchParams.get('location') || defaultQuery.location || '';
  const propertyType = searchParams.get('property_type') || defaultQuery.property_type || '';
  const bedrooms = searchParams.get('bedrooms') || defaultQuery.bedrooms || '';
  const bathrooms = searchParams.get('bathrooms') || defaultQuery.bathrooms || '';
  const furnishing = searchParams.get('furnishing') || defaultQuery.furnishing || '';
  const tenancy = searchParams.get('tenancy') || defaultQuery.tenancy || '';
  const viewType = searchParams.get('view_type') || defaultQuery.view_type || '';
  const minArea = searchParams.get('min_area') || defaultQuery.min_area || '';
  const maxArea = searchParams.get('max_area') || defaultQuery.max_area || '';
  const sortBy = searchParams.get('sort_by') || defaultQuery.sort_by || '';
  const query = searchParams.get('q') || defaultQuery.q || '';

  const [searchValue, setSearchValue] = useState(query);

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
      return `${basePath}?${params.toString()}`;
    };
    return createURL;
  }, [basePath, searchParams]);

  const clearAll = () => {
    setSearchValue('');
    router.push(basePath);
    onResultsChange?.(0);
  };

  const applySearch = () => {
    router.push(updateParams({ q: searchValue || null }));
  };

  const activeFilterCount = [location, propertyType, bedrooms, bathrooms, furnishing, tenancy, viewType, minArea, maxArea, sortBy, query].filter(Boolean).length;

  return (
    <div className="space-y-4 sticky top-16 z-40">
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applySearch();
            }}
            className="pl-9 w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <Select value={location} onValueChange={(value) => router.push(updateParams({ location: value || null }))}>
              <SelectTrigger className="pl-9 w-full">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl max-h-[300px] overflow-y-auto">
                <SelectItem value="">All locations</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <Select value={propertyType} onValueChange={(value) => router.push(updateParams({ property_type: value || null }))}>
              <SelectTrigger className="pl-9 w-full">
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                <SelectItem value="">All types</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <Select value={bedrooms} onValueChange={(value) => router.push(updateParams({ bedrooms: value || null }))}>
              <SelectTrigger className="pl-9 w-full">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                <SelectItem value="">Any bedrooms</SelectItem>
                {BEDROOMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <FilterAccordion title="More Filters" defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={bathrooms} onValueChange={(value) => router.push(updateParams({ bathrooms: value || null }))}>
                <SelectTrigger className="pl-9 w-full">
                  <SelectValue placeholder="Bathrooms" />
                </SelectTrigger>
                <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                  <SelectItem value="">Any bathrooms</SelectItem>
                  {BATHROOMS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={furnishing} onValueChange={(value) => router.push(updateParams({ furnishing: value || null }))}>
                <SelectTrigger className="pl-9 w-full">
                  <SelectValue placeholder="Furnishing" />
                </SelectTrigger>
                <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                  <SelectItem value="">Any</SelectItem>
                  {FURNISHING_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={tenancy} onValueChange={(value) => router.push(updateParams({ tenancy: value || null }))}>
                <SelectTrigger className="pl-9 w-full">
                  <SelectValue placeholder="Tenancy" />
                </SelectTrigger>
                <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                  <SelectItem value="">Any</SelectItem>
                  {TENANCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={minArea} onValueChange={(value) => router.push(updateParams({ min_area: value || null }))}>
                <SelectTrigger className="pl-9 w-full">
                  <SelectValue placeholder="Min area" />
                </SelectTrigger>
                <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                  {AREA_RANGES.map((opt) => (
                    <SelectItem key={opt.value || 'any'} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={maxArea} onValueChange={(value) => router.push(updateParams({ max_area: value || null }))}>
                <SelectTrigger className="pl-9 w-full">
                  <SelectValue placeholder="Max area" />
                </SelectTrigger>
                <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                  {AREA_RANGES.map((opt) => (
                    <SelectItem key={opt.value || 'any'} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={viewType} onValueChange={(value) => router.push(updateParams({ view_type: value || null }))}>
                <SelectTrigger className="pl-9 w-full">
                  <SelectValue placeholder="View type" />
                </SelectTrigger>
                <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl max-h-[300px] overflow-y-auto">
                  <SelectItem value="">Any view</SelectItem>
                  {VIEW_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={sortBy} onValueChange={(value) => router.push(updateParams({ sort_by: value || null }))}>
                <SelectTrigger className="pl-9 w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent portal={false} className="absolute left-0 top-full z-[70] mt-2 w-[var(--radix-select-trigger-width)] bg-card border border-border shadow-xl">
                  <SelectItem value="">Default</SelectItem>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterAccordion>

        {(location || propertyType || bedrooms || bathrooms || furnishing || tenancy || viewType || minArea || maxArea || sortBy || query) && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}</span>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive/80 h-8 px-2">
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}