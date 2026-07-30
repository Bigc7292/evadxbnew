import { Metadata } from 'next';
import { SecondaryPropertiesClient } from '@/lib/components/SecondaryProperties';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Secondary Properties | EVA Real Estate Dubai',
  description: 'Browse premium resale properties across Dubai\'s most coveted locations.',
};

export default async function SecondaryPropertiesPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <SecondaryPropertiesClient locale={locale} />
  );
}
