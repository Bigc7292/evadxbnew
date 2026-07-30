import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'off_plan';
  const property_type = searchParams.get('property_type') || undefined;
  const location = searchParams.get('location') || undefined;
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!, 10) : undefined;
  const min_price = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const max_price = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 24;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

  try {
    const result = await getProperties({
      status,
      property_type,
      location,
      bedrooms,
      min_price,
      max_price,
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
