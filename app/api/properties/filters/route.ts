import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const property_type = searchParams.get('property_type') || undefined;
  const listing_type = searchParams.get('listing_type') || undefined;
  const location = searchParams.get('location') || undefined;
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!, 10) : undefined;
  const bathrooms = searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!, 10) : undefined;
  const min_price = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const max_price = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
  const min_area = searchParams.get('min_area') ? parseFloat(searchParams.get('min_area')!) : undefined;
  const max_area = searchParams.get('max_area') ? parseFloat(searchParams.get('max_area')!) : undefined;
  const furnishing = searchParams.get('furnishing') || undefined;
  const tenancy = searchParams.get('tenancy') || undefined;
  const view_type = searchParams.get('view_type') || undefined;
  const ownership = searchParams.get('ownership') || undefined;
  const search = searchParams.get('q') || undefined;

  try {
    const result = await getProperties({
      status,
      property_type,
      listing_type,
      location,
      bedrooms,
      bathrooms,
      min_price,
      max_price,
      min_area,
      max_area,
      furnishing,
      tenancy,
      view_type,
      ownership,
      search,
      limit: 1,
    });

    const locations = [
      'Dubai', 'Palm Jumeirah', 'Downtown Dubai', 'Dubai Marina', 'Business Bay',
      'Dubai Hills Estate', 'City Walk', 'Dubai Investment Park', 'Palm Jebel Ali',
      'The Valley', 'Jumeirah Village', 'Ras Al Khor', 'Al Marjan Island',
    ];

    const propertyTypes = [
      'apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'commercial', 'land',
    ];

    const bedroomOptions = [1, 2, 3, 4, 5, 6, 7, 8];
    const bathroomOptions = [1, 2, 3, 4, 5];

    return NextResponse.json({
      totalCount: result.totalCount,
      locations,
      propertyTypes,
      bedroomOptions,
      bathroomOptions,
      furnishingOptions: ['Furnished', 'Semi furnished', 'Unfurnished'],
      tenancyOptions: ['Tenanted', 'Vacant'],
      viewOptions: [
        'Sea View', 'City View', 'Community View', 'Pool View', 'Garden View',
        'Golf View', 'Burj Khalifa View', 'Palm View', 'Waterfront', 'Park View',
      ],
    });
  } catch (error) {
    console.error('Failed to fetch available filters:', error);
    return NextResponse.json({ error: 'Failed to fetch available filters' }, { status: 500 });
  }
}