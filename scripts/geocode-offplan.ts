import { createClient } from '@supabase/supabase-js';
import https from 'https';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

interface LocationFallback {
  area_name: string;
  address: string | null;
  community: string | null;
  city: string;
  country: string;
  title: string;
  description: string;
}

function extractLocationHint(p: LocationFallback): string {
  const parts = [p.area_name, p.address, p.community, p.city, p.country].filter(Boolean);
  const base = parts.join(', ');
  const titleWords = p.title
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 6)
    .join(' ');

  const descMatch = p.description.match(/(?:in|at|near)\s+([A-Z][A-Za-z0-9\s]+?)(?:\.|,|;|\n|$)/i);
  const descLocation = descMatch ? descMatch[1].trim() : '';

  const candidates = [descLocation, titleWords, base].filter(Boolean);
  return candidates[0] || 'Dubai';
}

function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('accept-language', 'en');

    const timeout = setTimeout(() => resolve(null), 8000);

    https.get(url.toString(), {
      headers: {
        'User-Agent': 'EVA-RealEstate-PropertyGeocoder/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            resolve({ lat: parseFloat(parsed[0].lat), lng: parseFloat(parsed[0].lon) });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => {
      clearTimeout(timeout);
      resolve(null);
    });
  });
}

async function main() {
  console.log('🔎 Loading properties needing coordinates...');

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, slug, title, description, area_name, address, community, city, country, latitude, longitude')
    .eq('status', 'off_plan')
    .or('latitude.is.null,longitude.is.null');

  if (error) {
    console.error('Failed to load properties:', error);
    process.exit(1);
  }

  const targets = (properties || []).filter(p => p.latitude == null || p.longitude == null);
  console.log(`Found ${targets.length} properties missing coordinates`);

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    const query = extractLocationHint(p);

    console.log(`[${i + 1}/${targets.length}] ${p.slug} => "${query}"`);

    const coords = await geocode(query);

    if (coords) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ latitude: coords.lat, longitude: coords.lng })
        .eq('id', p.id);

      if (updateError) {
        console.error(`  ❌ Update failed: ${updateError.message}`);
        failed++;
      } else {
        console.log(`  ✅ ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
        updated++;
      }
    } else {
      console.log(`  ⚠️  No geocode result`);
      skipped++;
    }

    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  console.log(`\n✅ Updated ${updated}, skipped ${skipped}, failed ${failed}`);
}

main().catch(console.error);
