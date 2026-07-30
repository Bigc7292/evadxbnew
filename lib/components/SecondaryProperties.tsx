'use client';

import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/lib/supabase/queries';
import { ListingsGrid } from '@/lib/components/ListingsGrid';

interface SecondaryPropertiesClientProps {
  locale: string;
  limit?: number;
}

export function SecondaryPropertiesClient({ locale, limit = 100 }: SecondaryPropertiesClientProps) {
  const { data: propertiesResult, isLoading } = useQuery({
    queryKey: ['secondary-properties', limit],
    queryFn: async () => {
      const result = await getProperties({
        status: 'active',
        listing_type: 'sale',
        limit: limit || undefined,
      });
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 bg-muted/30" id="secondary-properties">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Secondary Market Properties
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover premium resale properties across Dubai&apos;s most coveted locations
          </p>
        </div>
        <ListingsGrid
          properties={propertiesResult?.properties || []}
          locale={locale}
          totalCount={propertiesResult?.totalCount || 0}
          hasMore={false}
          loading={isLoading}
          defaultFilters={{ listing_type: 'sale' }}
        />
      </div>
    </section>
  );
}
