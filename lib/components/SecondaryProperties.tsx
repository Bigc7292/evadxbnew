'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/lib/supabase/queries';
import { ListingsGrid } from '@/lib/components/ListingsGrid';
import { MobileFilterPanel } from '@/lib/components/MobileFilterPanel';

interface SecondaryPropertiesClientProps {
  locale: string;
}

export function SecondaryPropertiesClient({ locale }: SecondaryPropertiesClientProps) {
  const searchParams = useSearchParams();
  const basePath = `/${locale}/properties/secondary`;

  const filters = useMemo(() => {
    const location = searchParams.get('location') || '';
    const property_type = searchParams.get('property_type') || '';
    const bedrooms = searchParams.get('bedrooms') || '';
    const bathrooms = searchParams.get('bathrooms') || '';
    const furnishing = searchParams.get('furnishing') || '';
    const tenancy = searchParams.get('tenancy') || '';
    const view_type = searchParams.get('view_type') || '';
    const min_area = searchParams.get('min_area') || '';
    const max_area = searchParams.get('max_area') || '';
    const sort_by = searchParams.get('sort_by') || '';
    const q = searchParams.get('q') || '';

    const parsed: Record<string, string | undefined> = {};
    if (location) parsed.location = location;
    if (property_type) parsed.property_type = property_type;
    if (bedrooms) parsed.bedrooms = bedrooms;
    if (bathrooms) parsed.bathrooms = bathrooms;
    if (furnishing) parsed.furnishing = furnishing;
    if (tenancy) parsed.tenancy = tenancy;
    if (view_type) parsed.view_type = view_type;
    if (min_area) parsed.min_area = min_area;
    if (max_area) parsed.max_area = max_area;
    if (sort_by) parsed.sort_by = sort_by;
    if (q) parsed.search = q;
    return parsed;
  }, [searchParams]);

  const { data: propertiesResult, isLoading, refetch } = useQuery({
    queryKey: ['secondary-properties', filters],
    queryFn: async () => {
      const result = await getProperties({
        status: 'ready',
        listing_type: 'sale',
        limit: 100,
        ...filters,
      });
      return result;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-0" id="properties">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold gradient-gold mb-2">Secondary Market Properties</h1>
      <p className="text-muted-foreground mb-6">Browse premium resale properties across Dubai's most coveted locations.</p>
      <MobileFilterPanel basePath={basePath} defaultQuery={filters}>
        <ListingsGrid
          properties={propertiesResult?.properties ?? []}
          locale={locale}
          totalCount={propertiesResult?.totalCount ?? 0}
          hasMore={false}
          loading={isLoading}
          disableFilters
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl border border-border/70 px-4 py-2 text-sm"
          >
            Refresh results
          </button>
        </div>
      </MobileFilterPanel>
    </div>
  );
}