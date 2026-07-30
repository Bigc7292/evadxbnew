'use client';

import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/lib/supabase/queries';
import { ListingsGrid } from '@/lib/components/ListingsGrid';
import { PageFilterBar } from '@/lib/components/PageFilterBar';

interface SecondaryPropertiesClientProps {
  locale: string;
}

export function SecondaryPropertiesClient({ locale }: SecondaryPropertiesClientProps) {
  const { data: propertiesResult, isLoading, refetch } = useQuery({
    queryKey: ['secondary-properties', 'render'],
    queryFn: async () => {
      const result = await getProperties({
        status: 'active',
        listing_type: 'sale',
        limit: 100,
      });
      return result;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return (
    <PageFilterBar
      title="Secondary Market Properties"
      totalCount={propertiesResult?.totalCount ?? 0}
      basePath={`/${locale}/properties/secondary`}
    >
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
    </PageFilterBar>
  );
}
