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
const WORDPRESS_SITE_URL = 'https://evadxb.com';
const WORDPRESS_UPLOADS_URL = `${WORDPRESS_SITE_URL}/wp-content/uploads`;
const MAX_RETRIES = 2;
const PROPERTY_CONCURRENCY = 4;
const IMAGE_CONCURRENCY = 4;

function getExtensionFromUrl(url: string): string {
  try {
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
  } catch {
    return '.jpg';
  }
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

function normalizeImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) {
    const normalized = `${WORDPRESS_SITE_URL}${url}`;
    return normalized;
  }
  return `${WORDPRESS_UPLOADS_URL}/${url}`;
}

function isSvgUrl(url: string): boolean {
  const lowered = url.toLowerCase();
  return lowered.endsWith('.svg') || lowered.includes('.svg?');
}

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);
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
      res.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
      });
      res.on('end', () => resolve(buffer));
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
  const { error } = await supabase.storage
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

async function processImageTask(
  task: {
    type: 'hero' | 'gallery';
    propertyId: string;
    slug: string;
    index?: number;
    sourceUrl: string;
    storagePath: string;
  }
): Promise<{ success: boolean; publicUrl?: string }> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const buffer = await downloadImage(task.sourceUrl);
      const ext = getExtensionFromUrl(task.sourceUrl);
      const mimeType = getMimeType(ext);
      const success = await uploadImage(buffer, task.storagePath, mimeType);
      if (success) {
        return { success: true, publicUrl: getPublicUrl(task.storagePath) };
      }
    } catch (err: any) {
      console.error(`    ${task.type}${task.index !== undefined ? `[${task.index}]` : ''} attempt ${attempt} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        return { success: false };
      }
    }
  }
  return { success: false };
}

async function processProperty(
  property: {
    id: string;
    slug: string;
    hero_image_url: string | null;
    gallery_images: string[] | null;
  }
): Promise<{ updated: boolean; heroUpdated: boolean; galleryUpdated: number; failed: number }> {
  const { id, slug } = property;
  const heroImageUrl = property.hero_image_url;
  const galleryImages = property.gallery_images || [];
  
  const tasks: Array<{
    type: 'hero' | 'gallery';
    propertyId: string;
    slug: string;
    index?: number;
    sourceUrl: string;
    storagePath: string;
  }> = [];

  if (heroImageUrl && !isAlreadyOnStorage(heroImageUrl)) {
    const normalizedHeroUrl = normalizeImageUrl(heroImageUrl);
    if (!normalizedHeroUrl) {
      console.error(`    Invalid hero URL for ${slug}: ${heroImageUrl}`);
    } else if (isSvgUrl(normalizedHeroUrl)) {
      console.log(`    Skipping unsupported SVG hero for ${slug}`);
    } else {
      try {
        new URL(normalizedHeroUrl);
        const ext = getExtensionFromUrl(normalizedHeroUrl);
        tasks.push({
          type: 'hero',
          propertyId: id,
          slug,
          sourceUrl: normalizedHeroUrl,
          storagePath: `properties/${slug}/hero${ext}`
        });
      } catch {
        console.error(`    Invalid hero URL for ${slug}: ${heroImageUrl}`);
      }
    }
  }

  for (let i = 0; i < galleryImages.length; i++) {
    const imgUrl = galleryImages[i];
    if (imgUrl && !isAlreadyOnStorage(imgUrl)) {
      const normalizedImgUrl = normalizeImageUrl(imgUrl);
      if (!normalizedImgUrl) {
        console.error(`    Invalid gallery URL for ${slug}[${i}]: ${imgUrl}`);
        continue;
      }
      if (isSvgUrl(normalizedImgUrl)) {
        console.log(`    Skipping unsupported SVG gallery[${i}] for ${slug}`);
        continue;
      }
      try {
        new URL(normalizedImgUrl);
        const ext = getExtensionFromUrl(normalizedImgUrl);
        tasks.push({
          type: 'gallery',
          propertyId: id,
          slug,
          index: i,
          sourceUrl: normalizedImgUrl,
          storagePath: `properties/${slug}/gallery_${i}${ext}`
        });
      } catch {
        console.error(`    Invalid gallery URL for ${slug}[${i}]: ${imgUrl}`);
      }
    }
  }

  if (tasks.length === 0) {
    return { updated: false, heroUpdated: false, galleryUpdated: 0, failed: 0 };
  }

  const results = new Map<string, { success: boolean; publicUrl?: string }>();
  const queue = [...tasks];
  const active = new Set<Promise<void>>();

  while (queue.length > 0 || active.size > 0) {
    while (active.size < IMAGE_CONCURRENCY && queue.length > 0) {
      const task = queue.shift()!;
      const key = `${task.type}-${task.index !== undefined ? task.index : 'hero'}`;
      const promise = processImageTask(task).then(result => {
        results.set(key, result);
        active.delete(promise);
      });
      active.add(promise);
    }

    if (active.size > 0) {
      await Promise.race(active);
    }
  }

  await Promise.all(active);

  let heroUpdated = false;
  let galleryUpdated = 0;
  let failed = 0;
  let updatedHeroUrl = heroImageUrl;
  const updatedGallery = [...galleryImages];

  results.forEach((result, key) => {
    if (key.startsWith('hero')) {
      if (result.success && result.publicUrl) {
        heroUpdated = true;
        updatedHeroUrl = result.publicUrl;
      } else {
        failed++;
      }
    } else if (key.startsWith('gallery')) {
      if (result.success && result.publicUrl) {
        galleryUpdated++;
        const idx = parseInt(key.split('-')[1], 10);
        if (!isNaN(idx)) {
          updatedGallery[idx] = result.publicUrl;
        }
      } else {
        failed++;
      }
    }
  });

  const needsDbUpdate = heroUpdated || galleryUpdated > 0;

  if (needsDbUpdate) {
    const updatePayload: Record<string, unknown> = {};
    if (heroUpdated) updatePayload.hero_image_url = updatedHeroUrl;
    if (galleryUpdated > 0) updatePayload.gallery_images = updatedGallery;

    const { error: updateError } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      console.error(`    DB update failed for ${slug}: ${updateError.message}`);
    }
  }

  return { updated: needsDbUpdate, heroUpdated, galleryUpdated, failed };
}

async function main() {
  console.log('=== Property Images Upload Script ===');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Property concurrency: ${PROPERTY_CONCURRENCY}`);
  console.log(`Image concurrency per property: ${IMAGE_CONCURRENCY}\n`);

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

  const needsProcessing = properties.filter(p => {
    const hasExternalHero = p.hero_image_url && !isAlreadyOnStorage(p.hero_image_url);
    const hasExternalGallery = p.gallery_images && p.gallery_images.some((img: string) => img && !isAlreadyOnStorage(img));
    return hasExternalHero || hasExternalGallery;
  });

  console.log(`Total properties: ${properties.length}`);
  console.log(`Properties needing upload: ${needsProcessing.length}\n`);

  let totalUpdated = 0;
  let totalHeroUpdated = 0;
  let totalGalleryUpdated = 0;
  let totalFailed = 0;
  let totalSkipped = properties.length - needsProcessing.length;

  const queue = [...needsProcessing];
  const active = new Set<Promise<void>>();
  let processed = 0;

  while (queue.length > 0 || active.size > 0) {
    while (active.size < PROPERTY_CONCURRENCY && queue.length > 0) {
      const prop = queue.shift()!;
      const promise = processProperty(prop).then(result => {
        processed++;
        totalUpdated += result.updated ? 1 : 0;
        totalHeroUpdated += result.heroUpdated ? 1 : 0;
        totalGalleryUpdated += result.galleryUpdated;
        totalFailed += result.failed;
        console.log(`[${processed}/${needsProcessing.length}] ${prop.slug} -> hero=${result.heroUpdated ? 'updated' : 'skipped'}, gallery=${result.galleryUpdated} updated, failed=${result.failed}`);
        active.delete(promise);
      }).catch(err => {
        processed++;
        console.error(`[${processed}/${needsProcessing.length}] ${prop.slug} -> fatal: ${err.message}`);
        totalFailed++;
        active.delete(promise);
      });
      active.add(promise);
    }

    if (active.size > 0) {
      await Promise.race(active);
    }
  }

  await Promise.all(active);

  console.log('\n=== Summary ===');
  console.log(`Total properties: ${properties.length}`);
  console.log(`Properties skipped (already on storage): ${totalSkipped}`);
  console.log(`Properties updated: ${totalUpdated}`);
  console.log(`Hero images uploaded: ${totalHeroUpdated}`);
  console.log(`Gallery images uploaded: ${totalGalleryUpdated}`);
  console.log(`Failed images: ${totalFailed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
