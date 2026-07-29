import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wc-webhook-signature, x-wc-webhook-topic',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify WooCommerce webhook signature
    const signature = req.headers.get('x-wc-webhook-signature');
    const topic = req.headers.get('x-wc-webhook-topic');
    const webhookSecret = Deno.env.get('WOOCOMMERCE_WEBHOOK_SECRET');

    if (webhookSecret && signature) {
      const body = await req.text();
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
      const expectedHex = Array.from(new Uint8Array(expectedSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (signature !== expectedHex) {
        console.error('WooCommerce webhook signature verification failed');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = JSON.parse(body);
    }

    const payload = await req.json();

    // Handle different webhook topics
    switch (topic) {
      case 'order.created':
      case 'order.updated':
        await handleOrderWebhook(supabase, payload, topic);
        break;
      case 'product.created':
      case 'product.updated':
        await handleProductWebhook(supabase, payload, topic);
        break;
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerWebhook(supabase, payload, topic);
        break;
      default:
        console.log(`Unhandled WooCommerce topic: ${topic}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('WooCommerce Webhook Error:', error);
    
    // Log failed webhook
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('external_webhooks')
        .insert({
          source: 'woocommerce',
          event_type: `webhook_failed_${topic}`,
          payload: await req.json().catch(() => ({})),
          processed: false,
          error: error.message,
        });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleOrderWebhook(supabase: any, payload: any, topic: string) {
  const order = payload;
  
  // Extract property ID from order meta or line items
  let propertyId = null;
  if (order.line_items && order.line_items.length > 0) {
    const item = order.line_items[0];
    propertyId = item.meta_data?.find((m: any) => m.key === '_property_id')?.value;
  }

  // Create/update lead
  const leadData = {
    first_name: order.billing?.first_name || '',
    last_name: order.billing?.last_name || '',
    email: order.billing?.email || '',
    phone: order.billing?.phone || '',
    source: 'woocommerce',
    source_page: `order_${order.id}`,
    property_id: propertyId,
    utm_source: order.utm_source,
    utm_medium: order.utm_medium,
    utm_campaign: order.utm_campaign,
    utm_content: order.utm_content,
    utm_term: order.utm_term,
    status: order.status === 'completed' ? 'qualified' : 'new',
    notes: `WooCommerce Order #${order.id} - ${order.total} ${order.currency}`,
  };

  const { data, error } = await supabase
    .from('leads')
    .upsert(leadData, { onConflict: 'email,source_page' })
    .select()
    .single();

  if (error) throw error;

  // Log webhook
  await supabase
    .from('external_webhooks')
    .insert({
      source: 'woocommerce',
      event_type: topic,
      payload: order,
      processed: true,
      lead_id: data.id,
    });
}

async function handleProductWebhook(supabase: any, payload: any, topic: string) {
  const product = payload;
  
  // Check if this is a property product
  const isProperty = product.categories?.some((c: any) => 
    c.name.toLowerCase().includes('property') || c.name.toLowerCase().includes('real estate')
  );

  if (isProperty) {
    const slug = product.slug || generateSlug(product.name);
    
    const propertyData = {
      slug,
      title: product.name,
      short_description: product.short_description || '',
      description: product.description || '',
      property_type: mapWooCategoryToPropertyType(product.categories),
      listing_type: 'sale',
      status: product.status === 'publish' ? 'active' : 'draft',
      price_min: product.price ? parseFloat(product.price) : null,
      price_max: product.regular_price ? parseFloat(product.regular_price) : null,
      price_currency: 'AED',
      hero_image_url: product.images?.[0]?.src || null,
      gallery_images: product.images?.map((img: any) => img.src) || [],
      woocommerce_product_id: product.id.toString(),
      is_featured: product.featured,
      published_at: product.date_created_gmt || new Date().toISOString(),
    };

    await supabase
      .from('properties')
      .upsert(propertyData, { onConflict: 'slug' });
  }

  await supabase
    .from('external_webhooks')
    .insert({
      source: 'woocommerce',
      event_type: topic,
      payload: product,
      processed: true,
    });
}

async function handleCustomerWebhook(supabase: any, payload: any, topic: string) {
  await supabase
    .from('external_webhooks')
    .insert({
      source: 'woocommerce',
      event_type: topic,
      payload: payload,
      processed: true,
    });
}

function mapWooCategoryToPropertyType(categories: any[]): string {
  for (const cat of categories || []) {
    const name = cat.name.toLowerCase();
    if (name.includes('villa')) return 'villa';
    if (name.includes('townhouse')) return 'townhouse';
    if (name.includes('penthouse')) return 'penthouse';
    if (name.includes('studio')) return 'studio';
    if (name.includes('commercial')) return 'commercial';
    if (name.includes('land')) return 'land';
  }
  return 'apartment';
}

function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  slug += `-${Date.now()}`;
  return slug;
}