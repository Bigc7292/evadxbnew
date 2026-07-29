import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPropertyBySlug } from '@/lib/supabase/queries';
import { PropertyDetail } from '@/lib/components/PropertyDetail';
import { CustomCursor } from '@/lib/components/CustomCursor';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);
  
  if (!property) {
    return { title: 'Property Not Found' };
  }

  return {
    title: property.title,
    description: property.short_description || property.description?.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.short_description || property.description?.slice(0, 160),
      images: property.featured_image ? [property.featured_image] : [],
    },
  };
}

export async function generateStaticParams() {
  // This would be populated from the database in production
  return [];
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <>
      <CustomCursor />
      <PropertyDetail property={property} locale={locale} />
    </>
  );
}