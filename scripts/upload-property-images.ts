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
  } catch {
    // ignore
  }
  return env;
}

const env = loadEnvFile(path.join(process.cwd(), '.env.local'));

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const BUCKET_NAME = 'property-images';
const STORAGE_BASE_URL = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}`;
const DELAY_MS = 600;
const MAX_RETRIES = 3;

function getExtensionFromUrl(url: string): string {
  const parsed = new URL(url);
  const pathname = parsed.pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (ext && ext.length <= 6) return ext;
  const contentType = parsed.searchParams.get('content-type') || '';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('svg')) return '.svg';
  return '.jpg';
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
  };
  return map[ext] || 'image/jpeg';
}

function isAlreadyOnStorage(url: string | null): boolean {
  if (!url) return false;
  return url.includes(`${BUCKET_NAME}/`);
}

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EVA-DXB-Image-Uploader/1.0)',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        resolve(downloadImage(redirectUrl));
        return;
      }
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
    req.setTimeout(30000);
    req.end();
  });
}

async function uploadImage(
  buffer: Buffer,
  filePath: string,
  mimeType: string
): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
      cacheControl: '31536000',
    });

  if (error) {
    console.error(`    Upload error: ${error.message}`);
    return false;
  }
  return true;
}

function getPublicUrl(filePath: string): string {
  return `${STORAGE_BASE_URL}/${filePath}`;
}

async function processProperty(
  property: {
    id: string;
    slug: string;
    hero_image_url: string | null;
    gallery_images: string[] | null;
  }
): Promise<{ updated: boolean; heroUpdated: boolean; galleryUpdated: number; failed: number }> {
  const { id, slug, hero_image_url, gallery_images } = property;
  let updated = false;
  let heroUpdated = false;
  let galleryUpdated = 0;
  let failed = 0;

  const heroPath = `properties/${slug}/hero.jpg`;

  if (hero_image_url && !isAlreadyOnStorage(hero_image_url)) {
    console.log(`  Downloading hero image...`);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const buffer = await downloadImage(hero_image_url);
        const ext = getExtensionFromUrl(hero_image_url);
        const mimeType = getMimeType(ext);
        const finalPath = `properties/${slug}/hero${ext}`;
        const success = await uploadImage(buffer, finalPath, mimeType);
        if (success) {
          const publicUrl = getPublicUrl(finalPath);
          const { error: updateError } = await supabase
            .from('properties')
            .update({ hero_image_url: publicUrl })
            .eq('id', id);
          if (updateError) {
            console.error(`    Hero DB update failed: ${updateError.message}`);
            failed++;
          } else {
            console.log(`    Hero uploaded: ${finalPath}`);
            heroUpdated = true;
            updated = true;
          }
          break;
        }
      } catch (err: any) {
        console.error(`    Hero download/upload attempt ${attempt} failed: ${err.message}`);
        if (attempt === MAX_RETRIES) {
          console.error(`    Skipping hero image for ${slug}`);
          failed++;
        }
      }
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, DELAY_MS * attempt));
      }
    }
  } else if (hero_image_url && isAlreadyOnStorage(hero_image_url)) {
    console.log(`  Hero already on storage, skipping`);
  }

  await new Promise((r) => setTimeout(r, DELAY_MS));

  if (gallery_images && gallery_images.length > 0) {
    const currentGallery = gallery_images as string[];
    const updatedGallery: string[] = [];

    for (let i = 0; i < currentGallery.length; i++) {
      const imgUrl = currentGallery[i];
      const galleryPath = `properties/${slug}/gallery_${i}.jpg`;

      if (isAlreadyOnStorage(imgUrl)) {
        console.log(`  Gallery[${i}] already on storage, skipping`);
        updatedGallery.push(imgUrl);
        continue;
      }

      console.log(`  Downloading gallery[${i}]...`);
      let uploaded = false;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const buffer = await downloadImage(imgUrl);
          const ext = getExtensionFromUrl(imgUrl);
          const mimeType = getMimeType(ext);
          const finalPath = `properties/${slug}/gallery_${i}${ext}`;
          const success = await uploadImage(buffer, finalPath, mimeType);
          if (success) {
            const publicUrl = getPublicUrl(finalPath);
            updatedGallery.push(publicUrl);
            console.log(`    Gallery[${i}] uploaded: ${finalPath}`);
            galleryUpdated++;
            uploaded = true;
            updated = true;
            break;
          }
        } catch (err: any) {
          console.error(
            `    Gallery[${i}] attempt ${attempt} failed: ${err.message}`
          );
          if (attempt === MAX_RETRIES) {
            console.error(`    Skipping gallery[${i}] for ${slug}`);
            failed++;
            updatedGallery.push(imgUrl);
          }
        }
        if (!uploaded && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, DELAY_MS * attempt));
        }
      }

      await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    if (updatedGallery.length > 0) {
      const { error: galleryUpdateError } = await supabase
        .from('properties')
        .update({ gallery_images: updatedGallery })
        .eq('id', id);

      if (galleryUpdateError) {
        console.error(
          `    Gallery DB update failed: ${galleryUpdateError.message}`
        );
      }
    }
  }

  return { updated, heroUpdated, galleryUpdated, failed };
}

async function main() {
  console.log('=== Property Images Upload Script ===');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Storage Base URL: ${STORAGE_BASE_URL}`);
  console.log('');

  const { data: properties, error: fetchError } = await supabase
    .from('properties')
    .select('id, slug, hero_image_url, gallery_images')
    .order('slug');

  if (fetchError) {
    console.error('Failed to fetch properties:', fetchError.message);
    process.exit(1);
  }

  if (!properties || properties.length === 0) {
    console.log('No properties found.');
    return;
  }

  console.log(`Found ${properties.length} properties\n`);

  let totalUpdated = 0;
  let totalHeroUpdated = 0;
  let totalGalleryUpdated = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    console.log(`[${i + 1}/${properties.length}] ${prop.slug}`);

    const hasExternalHero = prop.hero_image_url && !isAlreadyOnStorage(prop.hero_image_url);
    const hasExternalGallery =
      prop.gallery_images &&
      prop.gallery_images.some((img: string) => !isAlreadyOnStorage(img));

    if (!hasExternalHero && !hasExternalGallery) {
      console.log('  All images already on storage, skipping\n');
      totalSkipped++;
      continue;
    }

    const result = await processProperty(prop);
    totalUpdated += result.updated ? 1 : 0;
    totalHeroUpdated += result.heroUpdated ? 1 : 0;
    totalGalleryUpdated += result.galleryUpdated;
    totalFailed += result.failed;

    console.log(`  Result: hero=${result.heroUpdated ? 'updated' : 'skipped'}, gallery=${result.galleryUpdated} updated, failed=${result.failed}\n`);

    if (i < properties.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log('=== Summary ===');
  console.log(`Total properties: ${properties.length}`);
  console.log(`Properties with updates: ${totalUpdated}`);
  console.log(`Properties skipped (already on storage): ${totalSkipped}`);
  console.log(`Hero images uploaded: ${totalHeroUpdated}`);
  console.log(`Gallery images uploaded: ${totalGalleryUpdated}`);
  console.log(`Failed images: ${totalFailed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});