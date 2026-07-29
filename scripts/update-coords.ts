import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

function latLngFromTile(x: number, y: number, zoom: number): { lat: number; lng: number } {
  const n = Math.pow(2, zoom);
  const lng = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
  const lat = latRad * 180 / Math.PI;
  return { lat, lng };
}

function extractCoordsFromMapsUrl(url: string | null): { lat: number | null; lng: number | null } {
  if (!url) return { lat: null, lng: null };
  try {
    const parsed = new URL(url);
    const iParam = Array.from(parsed.searchParams.keys()).find(k => k.startsWith('1i'));
    const jParam = Array.from(parsed.searchParams.keys()).find(k => k.startsWith('2i'));
    if (iParam && jParam) {
      const i = parseInt(iParam.slice(2));
      const j = parseInt(jParam.slice(2));
      const coords = latLngFromTile(i, j, 16);
      return { lat: coords.lat, lng: coords.lng };
    }
  } catch {
    // ignore parse errors
  }
  return { lat: null, lng: null };
}

async function main() {
  console.log('🔧 Updating coordinates from map URLs...');
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, slug, google_maps_embed_url, latitude, longitude')
    .eq('status', 'off_plan')
    .is('latitude', null)
    .is('longitude', null)
    .not('google_maps_embed_url', 'is', null);

  if (error) {
    console.error('Failed to fetch properties:', error);
    process.exit(1);
  }

  console.log(`Found ${properties?.length || 0} properties without coordinates`);

  let updated = 0;
  let failed = 0;

  for (const property of properties || []) {
    const coords = extractCoordsFromMapsUrl(property.google_maps_embed_url);
    
    if (coords.lat !== null && coords.lng !== null) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ latitude: coords.lat, longitude: coords.lng })
        .eq('id', property.id);

      if (updateError) {
        console.error(`  ❌ Failed to update ${property.slug}:`, updateError.message);
        failed++;
      } else {
        updated++;
        console.log(`  ✅ ${property.slug}: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      }
    } else {
      console.log(`  ⚠️  ${property.slug}: no coords found in map URL`);
    }
  }

  console.log(`\n✅ Updated ${updated} properties, ${failed} failed`);
}

main().catch(console.error);
