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
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .order('is_leader', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }
    if (role && role !== 'all') {
      query = query.eq('is_leader', role === 'leader');
    }
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,position.ilike.%${search}%`);
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
    console.error('Admin Agents GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
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

    if (!body.slug && body.first_name && body.last_name) {
      body.slug = slugify(`${body.first_name} ${body.last_name}`);
    }

    const { data, error } = await supabase
      .from('agents')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Admin Agents POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
