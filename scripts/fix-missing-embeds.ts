import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        env[key] = value;
      }
    }
  } catch (e) {
    // ignore
  }
  return env;
}

const env = loadEnvFile(path.join(process.cwd(), '.env.local'));

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY!;
const firecrawlApiKey = env.FIRECRAWL_API_KEY || 'fc-0c031f0c21384ee18c2c82bd0e6654e3';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

function httpsPost(options: any, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = https.request({
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function scrapeUrl(url: string): Promise<string | null> {
  const result = await httpsPost({
    hostname: 'api.firecrawl.dev',
    port: 443,
    path: '/v2/scrape',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlApiKey}`
    }
  }, {
    url,
    formats: ['markdown'],
    onlyMainContent: true
  });

  if (result.data?.markdown) {
    return result.data.markdown;
  }
  return null;
}

function extractMapsEmbed(markdown: string): string | null {
  const mapsMatch = markdown.match(/https:\/\/maps\.googleapis\.com\/maps\/api\/js\/StaticMapService\.GetMapImage\?[^\s)]+/);
  return mapsMatch ? mapsMatch[0] : null;
}

async function main() {
  console.log('🔎 Loading off-plan properties missing google_maps_embed_url...\n');

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, slug, title')
    .eq('status', 'off_plan')
    .is('google_maps_embed_url', null)
    .order('slug');

  if (error) {
    console.error('Failed to load properties:', error);
    process.exit(1);
  }

  const targets = properties || [];
  console.log(`Found ${targets.length} properties missing google_maps_embed_url\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    const url = `https://evadxb.com/${p.slug}/`;
    console.log(`[${i + 1}/${targets.length}] ${p.slug}`);

    const markdown = await scrapeUrl(url);
    if (markdown) {
      const embed = extractMapsEmbed(markdown);
      if (embed) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ google_maps_embed_url: embed })
          .eq('id', p.id);

        if (updateError) {
          console.error(`  ❌ Update failed: ${updateError.message}`);
          failed++;
        } else {
          console.log(`  ✅ Found embed`);
          updated++;
        }
      } else {
        console.log(`  ⚠️  No embed found on page`);
      }
    } else {
      console.log(`  ❌ Scrape failed`);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 600));
  }

  console.log(`\n✅ Updated ${updated}, failed ${failed}`);
}

main().catch(console.error);
