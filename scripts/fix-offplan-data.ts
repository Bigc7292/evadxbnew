import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key && value) env[key] = value;
  }
  return env;
}

const envPath = path.join(__dirname, '../.env.local');
const env = loadEnvFile(envPath);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const dataPath = path.join(__dirname, '../data/offplan-scraped.json');

function loadScrapedData(): any[] {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load scraped data:', e);
  }
  return [];
}

function isValidImage(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.toLowerCase().endsWith('.svg')) return false;
  if (/logo/i.test(url) && !/layout/i.test(url)) return false;
  return true;
}

function getValidImage(property: any): string | null {
  const hero = property.hero_image_url;
  if (isValidImage(hero)) return hero;
  
  const gallery = property.gallery_images || [];
  const validGallery = gallery.filter((img: string) => isValidImage(img));
  return validGallery[0] || null;
}

async function fixData() {
  const scrapedProperties = loadScrapedData();
  console.log(`Loaded ${scrapedProperties.length} scraped properties`);

  let updated = 0;
  let skipped = 0;

  for (const property of scrapedProperties) {
    const slug = property.slug;
    if (!slug) continue;

    const price = property.price_min || property.price_max;
    const validImage = getValidImage(property);
    const galleryImages = (property.gallery_images || []).filter((img: string) => isValidImage(img));

    if (!price && !validImage) {
      skipped++;
      continue;
    }

    const updates: any = {};

    if (price && price > 10000) {
      updates.price_min = price;
      updates.price_max = price;
    }

    if (validImage) {
      updates.hero_image_url = validImage;
    }

    if (galleryImages.length > 0) {
      updates.gallery_images = galleryImages;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('properties')
        .update(updates)
        .eq('slug', slug);

      if (error) {
        console.error(`Failed to update ${slug}:`, error.message);
      } else {
        updated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`\nFix complete: ${updated} updated, ${skipped} skipped`);
}

fixData().catch(console.error);
