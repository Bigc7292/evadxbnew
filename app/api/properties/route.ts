import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

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
  const sort_by = searchParams.get('sort_by') as 'price_asc' | 'price_desc' | 'newest' | 'area' | undefined;
  const search = searchParams.get('q') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 24;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

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
      sort_by,
      search,
      limit,
      offset,
    });

    return NextResponse.json({ properties: result.properties, count: result.totalCount }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}