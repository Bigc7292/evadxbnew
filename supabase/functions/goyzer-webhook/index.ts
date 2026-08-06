import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

interface GoyzerPayload {
  listing_id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: 'sale' | 'rent';
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  location: {
    address: string;
    area: string;
    community: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  features: string[];
  amenities: string[];
  images: string[];
  floor_plans: string[];
  video_url?: string;
  virtual_tour_url?: string;
  developer: string;
  project_name: string;
  completion_date?: string;
  payment_plan?: {
    down_payment: number;
    during_construction: number;
    on_handover: number;
  };
  status: 'active' | 'pending' | 'sold' | 'rented' | 'off_market' | 'draft';
  agent_email?: string;
  external_id: string;
  source: 'goyzer';
}

Deno.serve(async (req: Request) => {
  const requestOrigin = req.headers.get('origin');
  const cors = getCorsHeaders(requestOrigin);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook secret
    const webhookSecret = Deno.env.get('GOYZER_WEBHOOK_SECRET');
    const signature = req.headers.get('x-goyzer-signature');
    
    if (webhookSecret && signature) {
      const body = await req.text();
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        hexToBytes(signature),
        encoder.encode(body)
      );
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { headers: { ...cors, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      const payload = JSON.parse(body);
      await processGoyzerPayload(supabase, payload);
      return new Response(
        JSON.stringify({ success: true, message: 'Processed' }),
        { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // If no secret, just process directly
    const payload: GoyzerPayload = await req.json();
    await processGoyzerPayload(supabase, payload);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Processed' }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Goyzer webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function processGoyzerPayload(supabase: any, payload: GoyzerPayload) {
  const slug = generateSlug(payload.title);
  
  // Resolve developer
  let developerId = null;
  if (payload.developer) {
    const { data: existingDeveloper } = await supabase
      .from('developers')
      .select('id')
      .eq('name', payload.developer)
      .maybeSingle();

    if (existingDeveloper) {
      developerId = existingDeveloper.id;
    } else {
      const developerSlug = generateSlug(payload.developer);
      const { data: newDeveloper } = await supabase
        .from('developers')
        .insert({
          name: payload.developer,
          slug: developerSlug,
          is_active: true,
        })
        .select('id')
        .single();
      developerId = newDeveloper?.id ?? null;
    }
  }

  // Resolve agent
  let agentId = null;
  if (payload.agent_email) {
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('email', payload.agent_email)
      .maybeSingle();
    agentId = agent?.id ?? null;
  }

  const propertyData: any = {
    slug,
    title: payload.title,
    description: payload.description,
    short_description: payload.description?.slice(0, 300) || '',
    property_type: mapPropertyType(payload.property_type),
    listing_type: payload.listing_type,
    status: mapGoyzerStatus(payload.status),
    price_min: payload.price,
    price_max: payload.price,
    price_currency: payload.currency || 'AED',
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    area_sqft: payload.area_sqft,
    address: payload.location.address,
    area_name: payload.location.area,
    community: payload.location.community,
    city: payload.location.city || 'Dubai',
    country: payload.location.country || 'UAE',
    latitude: payload.location.latitude,
    longitude: payload.location.longitude,
    features: payload.features || [],
    amenities: payload.amenities || [],
    hero_image_url: payload.images?.[0] || null,
    gallery_images: payload.images || [],
    floor_plan_images: payload.floor_plans || [],
    video_url: payload.video_url || null,
    virtual_tour_url: payload.virtual_tour_url || null,
    developer_id: developerId,
    project_name: payload.project_name,
    completion_date: payload.completion_date || null,
    payment_plan: payload.payment_plan || null,
    goyzer_listing_id: payload.listing_id,
    external_id: payload.external_id,
    external_source: 'goyzer',
    is_featured: false,
    is_promoted: false,
    published_at: new Date().toISOString(),
  };

  if (agentId) {
    propertyData.agent_id = agentId;
  }

  // Upsert property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .upsert(propertyData, { onConflict: 'goyzer_listing_id' })
    .select()
    .single();

  if (propertyError) throw propertyError;

  // Log webhook
  await supabase
    .from('external_webhooks')
    .insert({
      source: 'goyzer',
      event_type: 'listing_sync',
      payload: payload,
      processed: true,
      property_id: property.id,
    });

  // Link agent separately if provided
  if (payload.agent_email && !agentId) {
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('email', payload.agent_email)
      .maybeSingle();
    
    if (agent) {
      await supabase
        .from('properties')
        .update({ agent_id: agent.id })
        .eq('id', property.id);
    }
  }
}

function mapPropertyType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('villa')) return 'villa';
  if (t.includes('townhouse')) return 'townhouse';
  if (t.includes('penthouse')) return 'penthouse';
  if (t.includes('studio')) return 'studio';
  if (t.includes('commercial')) return 'commercial';
  if (t.includes('land') || t.includes('plot')) return 'land';
  return 'apartment';
}

function mapGoyzerStatus(status: string): string {
  if (!status) return 'secondary';
  const normalized = status.toLowerCase();
  if (normalized === 'off_plan' || normalized === 'off-plan' || normalized === 'offplan') return 'off_plan';
  if (normalized === 'secondary' || normalized === 'ready' || normalized === 'active' || normalized === 'available') return 'secondary';
  return 'secondary';
}

function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
