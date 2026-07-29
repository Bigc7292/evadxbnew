import { Metadata } from 'next';
import { getProperties } from '@/lib/supabase/queries';
import { InfinitePropertyGrid } from '@/lib/components/InfinitePropertyGrid';
import { CustomCursor } from '@/lib/components/CustomCursor';
import { OffPlanFilterBar } from '@/lib/components/OffPlanFilterBar';

export const metadata: Metadata = {
  title: 'Off-Plan Properties | EVA Real Estate Dubai',
  description: 'Explore premium off-plan properties in Dubai. New launches from Emaar, DAMAC, Meraas, Nakheel and more.',
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function fetchOffPlan(page: number, filters?: Record<string, string | undefined>) {
  const limit = 24;
  const offset = (page - 1) * limit;
  const bedrooms = filters?.bedrooms ? parseInt(filters.bedrooms, 10) : undefined;
  const min_price = filters?.min_price ? parseFloat(filters.min_price) : undefined;
  const max_price = filters?.max_price ? parseFloat(filters.max_price) : undefined;

  return getProperties({
    status: 'off_plan',
    property_type: filters?.property_type,
    location: filters?.location,
    bedrooms,
    min_price,
    max_price,
    limit,
    offset,
  });
}

export default async function OffPlanPropertiesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = {
    property_type: typeof resolvedSearchParams.property_type === 'string' ? resolvedSearchParams.property_type : undefined,
    location: typeof resolvedSearchParams.location === 'string' ? resolvedSearchParams.location : undefined,
    bedrooms: typeof resolvedSearchParams.bedrooms === 'string' ? resolvedSearchParams.bedrooms : undefined,
    min_price: typeof resolvedSearchParams.min_price === 'string' ? resolvedSearchParams.min_price : undefined,
    max_price: typeof resolvedSearchParams.max_price === 'string' ? resolvedSearchParams.max_price : undefined,
  };

  const initialResult = await fetchOffPlan(1, filters);
  const initialProperties = initialResult.properties;
  const totalCount = initialResult.totalCount;

  return (
    <>
      <CustomCursor />
      <section className="px-4 sm:px-6 lg:px-8 py-16" id="properties">
        <div className="max-w-7xl mx-auto space-y-8">
          <OffPlanFilterBar totalCount={totalCount} />
          <InfinitePropertyGrid
            initialProperties={initialProperties}
            locale={locale}
            totalCount={totalCount}
            filters={filters}
          />
        </div>
      </section>
    </>
  );
}
