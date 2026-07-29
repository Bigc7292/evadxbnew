'use client';

import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/lib/supabase/queries';
import { ListingsGrid } from '@/lib/components/ListingsGrid';
import { HeroSection } from '@/lib/components/HeroSection';
import { CustomCursor } from '@/lib/components/CustomCursor';
import { SecondaryPropertiesClient } from '@/lib/components/SecondaryProperties';
import { useLocale } from 'next-intl';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function PropertiesPage({ params }: PageProps) {
  const locale = useLocale();
  const { data: propertiesResult, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const result = await getProperties({});
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <CustomCursor />
      <HeroSection />
      <section className="px-4 sm:px-6 lg:px-8 py-16" id="properties">
        <div className="max-w-7xl mx-auto">
          <ListingsGrid
            properties={propertiesResult?.properties || []}
            locale={locale}
            totalCount={propertiesResult?.totalCount || 0}
            hasMore={false}
            loading={isLoading}
          />
        </div>
      </section>
      <SecondaryPropertiesClient locale={locale} limit={12} />
    </>
  );
}
