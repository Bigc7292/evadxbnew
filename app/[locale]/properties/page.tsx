'use client';

import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/lib/supabase/queries';
import { ListingsGrid } from '@/lib/components/ListingsGrid';
import { HeroSection } from '@/lib/components/HeroSection';
import { CustomCursor } from '@/lib/components/CustomCursor';
import { SecondaryPropertiesClient } from '@/lib/components/SecondaryProperties';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useMemo, Suspense } from 'react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

type UrlFilters = {
  q?: string;
  property_type?: string;
  location?: string;
  listing_type?: string;
  bedrooms?: string;
  min_price?: string;
  max_price?: string;
  min_area?: string;
  max_area?: string;
};

function buildQueryFromUrl(sp: URLSearchParams): UrlFilters {
  const filters: UrlFilters = {};
  sp.forEach((value, key) => {
    if (value && value.trim() !== '') {
      filters[key as keyof UrlFilters] = value;
    }
  });
  return filters;
}

function PropertiesContent() {
  const locale = useLocale();
  const t = useTranslations('properties.filters');
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlFilters = buildQueryFromUrl(searchParams);

  const dbFilters = useMemo(() => {
    const filters: Record<string, any> = {};
    if (urlFilters.q) filters.search = urlFilters.q;
    if (urlFilters.property_type) filters.property_type = urlFilters.property_type;
    if (urlFilters.location) filters.location = urlFilters.location;
    if (urlFilters.listing_type) filters.listing_type = urlFilters.listing_type;
    if (urlFilters.bedrooms) filters.bedrooms = parseInt(urlFilters.bedrooms, 10);
    if (urlFilters.min_price) filters.min_price = parseFloat(urlFilters.min_price);
    if (urlFilters.max_price) filters.max_price = parseFloat(urlFilters.max_price);
    if (urlFilters.min_area) filters.min_area = parseFloat(urlFilters.min_area);
    if (urlFilters.max_area) filters.max_area = parseFloat(urlFilters.max_area);
    return filters;
  }, [urlFilters]);

  const { data: propertiesResult, isLoading } = useQuery({
    queryKey: ['properties', dbFilters],
    queryFn: async () => {
      const result = await getProperties(dbFilters);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateFilters = (filters: Record<string, any>) => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        next.set(key, String(value));
      }
    });
    const qs = next.toString();
    router.replace(`/${locale}/properties${qs ? `?${qs}` : ''}`);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16" id="properties">
      <div className="max-w-7xl mx-auto">
        <ListingsGrid
          properties={propertiesResult?.properties || []}
          locale={locale}
          totalCount={propertiesResult?.totalCount || 0}
          hasMore={false}
          loading={isLoading}
          filters={{
            search: urlFilters.q || '',
            property_type: urlFilters.property_type || '',
            location: urlFilters.location || '',
            listing_type: urlFilters.listing_type || '',
            bedrooms: urlFilters.bedrooms || '',
            priceRange: [
              urlFilters.min_area ? parseFloat(urlFilters.min_area) : 0,
              urlFilters.max_area ? parseFloat(urlFilters.max_area) : 5000000,
            ],
            priceMin: urlFilters.min_price ? parseFloat(urlFilters.min_price) : undefined,
            priceMax: urlFilters.max_price ? parseFloat(urlFilters.max_price) : undefined,
            min_area: urlFilters.min_area ? parseFloat(urlFilters.min_area) : undefined,
            max_area: urlFilters.max_area ? parseFloat(urlFilters.max_area) : undefined,
          }}
          onFiltersChange={updateFilters}
          defaultFilters={{ listing_type: 'sale' }}
        />
      </div>
    </section>
  );
}

export default function PropertiesPage({ params }: PageProps) {
  return (
    <>
      <CustomCursor />
      <HeroSection />
      <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-16"><div className="max-w-7xl mx-auto"><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-64 bg-muted rounded" /></div></div></div>}>
        <PropertiesContent />
      </Suspense>
      <SecondaryPropertiesClient locale={useLocale()} />
    </>
  );
}
