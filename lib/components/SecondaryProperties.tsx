'use client';

import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/lib/supabase/queries';
import { ListingsGrid } from '@/lib/components/ListingsGrid';
import { PageFilterBar } from '@/lib/components/PageFilterBar';

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
    <PageFilterBar title="Secondary Market Properties" totalCount={propertiesResult?.totalCount || 0} basePath={`/${locale}/properties/secondary`}>
      <ListingsGrid
        properties={propertiesResult?.properties || []}
        locale={locale}
        totalCount={propertiesResult?.totalCount || 0}
        hasMore={false}
        loading={isLoading}
        disableFilters
      />
    </PageFilterBar>
  );
}
