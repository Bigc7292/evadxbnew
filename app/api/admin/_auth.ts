import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function requireAdmin(request: NextRequest) {
  const supabase = await createClient();

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  let token = bearerToken;
  if (!token) {
    const cookie = request.cookies.get('sb-access-token');
    if (cookie) token = cookie.value;
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const isAdmin =
    data.user.user_metadata?.role === 'admin' ||
    data.user.app_metadata?.role === 'admin';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { createAdminClient } = await import('@/lib/supabase/server');
  const adminSupabase = await createAdminClient();

  return { supabase: adminSupabase, user: data.user };
}
