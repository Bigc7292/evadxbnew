import { ListingsGrid } from '@/lib/components/ListingsGrid';
import { HeroSection } from '@/lib/components/HeroSection';
import { CustomCursor } from '@/lib/components/CustomCursor';
import { getProperties } from '@/lib/supabase/queries';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Properties | EVA Real Estate Dubai',
  description: 'Browse luxury properties for sale and rent in Dubai. Off-plan projects, ready homes, and investment opportunities from top developers.',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PropertiesPage({ params }: PageProps) {
  const { locale } = await params;
  let propertiesResult: Awaited<ReturnType<typeof getProperties>> = { properties: [], totalCount: 0 };
  try {
    propertiesResult = await getProperties({});
  } catch (error) {
    console.error('Failed to load properties:', error);
  }

  return (
    <>
      <CustomCursor />
      <HeroSection />
      <section className="px-4 sm:px-6 lg:px-8 py-16" id="properties">
        <div className="max-w-7xl mx-auto">
          <ListingsGrid
            properties={propertiesResult.properties}
            locale={locale}
            totalCount={propertiesResult.totalCount}
            hasMore={false}
          />
        </div>
      </section>
    </>
  );
}
