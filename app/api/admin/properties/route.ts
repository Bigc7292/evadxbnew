import { requireAdmin } from '@/app/api/admin/_auth';
import { NextRequest, NextResponse } from 'next/server';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const supabase = auth.supabase;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const property_type = searchParams.get('property_type');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (property_type && property_type !== 'all') {
      query = query.eq('property_type', property_type);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%,area_name.ilike.%${search}%,developer.ilike.%${search}%`);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin Properties GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const supabase = auth.supabase;
    const body = await request.json();

    if (!body.slug && body.title) {
      body.slug = slugify(body.title);
    }

    const { data, error } = await supabase
      .from('properties')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Admin Properties POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
