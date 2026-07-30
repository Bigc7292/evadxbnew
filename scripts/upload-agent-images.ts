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
const MAX_RETRIES = 2;
const CONCURRENCY = 4;

const AGENT_IMAGE_MAP: Record<string, string> = {
  'iskender-duishembiev': 'https://evadxb.com/wp-content/uploads/25-iskender-duishembiev.jpg',
  'jenny-danchak': 'https://evadxb.com/wp-content/uploads/profile-pic-1031-yauheniya-danchak-1.jpg',
  'maria-cristina-campagna': 'https://evadxb.com/wp-content/uploads/immagine-whatsapp-2025-07-03-ore-16.37.34_cd2c7472-maria-cristina-campagna.jpg',
  'morgan-simone-grassineau': 'https://evadxb.com/wp-content/uploads/eva-profile-pic-1002-1-morgan-grassineau-1.jpg',
  'deepak-dhiman': 'https://evadxb.com/wp-content/uploads/dd-deepak-dhiman.jpeg',
  'haseeb-haider': 'https://evadxb.com/wp-content/uploads/img_2925-haseeb-haider.jpg',
  'anastasiia-brul': 'https://evadxb.com/wp-content/uploads/be92b670-6cf6-4344-a45c-ed86a11479c4-anastasiia-brul.jpeg',
  'mohammad-shekhani': 'https://evadxb.com/wp-content/uploads/img_20250626_142300_221-mohammad-mustafa-shekhani.jpg',
  'youssef-fawaz': 'https://evadxb.com/wp-content/uploads/0001_group-2-3.jpg',
  'olga-zadoya': 'https://evadxb.com/wp-content/uploads/0000_group-1-copy4.jpg',
  'elena-mardaeva': 'https://evadxb.com/wp-content/uploads/0000_group-1-copy2.jpg',
  'murat-balkizov': 'https://evadxb.com/wp-content/uploads/dsf1.jpg',
  'meshreky-ibrahem': 'https://evadxb.com/wp-content/uploads/0001_group-2_0001_edited-1-of-1-2.jpg',
  'anastasiya-nestsiarovist': 'https://evadxb.com/wp-content/uploads/img_5421-1.jpg',
  'mohamed-elfeil': 'https://evadxb.com/wp-content/uploads/mohammed.jpg',
  'lei-dandan': 'https://evadxb.com/wp-content/uploads/2323656.jpg',
  'raushan-mankeeva': 'https://evadxb.com/wp-content/uploads/0001_group-2_0000_group-1.jpg',
  'aidai-sultanbekova': 'https://evadxb.com/wp-content/uploads/0000_group-12_0001_group-5.jpg',
  'maia-hefling': 'https://evadxb.com/wp-content/uploads/newww.jpg',
  'eduard-suvarian': 'https://evadxb.com/wp-content/uploads/0001_group-2_0001_edited-5-of-6.jpg',
  'evgeniya-zagidullina': 'https://evadxb.com/wp-content/uploads/0001_group-2-copy1.jpg',
  'mathia-alex-delmonte': 'https://evadxb.com/wp-content/uploads/0001_group-2_0002_edited-6-of-6.jpg',
  'sara-saad': 'https://evadxb.com/wp-content/uploads/sara.jpg',
  'maryna-petrovskaja': 'https://evadxb.com/wp-content/uploads/0000_group-1-copy.jpg',
  'salim-rahmanian': 'https://evadxb.com/wp-content/uploads/salim.jpg',
  'anwar-albabbili': 'https://evadxb.com/wp-content/uploads/profile-picture-anwar-albabbili.jpg',
  'shabdan-duishembiev': 'https://evadxb.com/wp-content/uploads/shabdan.jpg',
  'ahmad-masaid': 'https://evadxb.com/wp-content/uploads/img-20250724-wa00011-ahmad-masaid.jpg',
  'aun-rushaid-fattah': 'https://evadxb.com/wp-content/uploads/arf-full-pic-dec24-aun-rushaid-ul-fattah.jpg',
  'adriaan-smith': 'https://evadxb.com/wp-content/uploads/profile-picture-adriaan-smith.png',
  'angelo-da-silveira-2': 'https://evadxb.com/wp-content/uploads/anjalo.jpg',
  'alpa-young': 'https://evadxb.com/wp-content/uploads/0000_group-12_0002_group-6.jpg',
  'tareq-terkmani': 'https://evadxb.com/wp-content/uploads/0001_group-2_0000_edited-2-of-6.jpg',
  'caesar-jangid': 'https://evadxb.com/wp-content/uploads/img_5915-caesar-jangid-1.png',
  'nida-merchant': 'https://evadxb.com/wp-content/uploads/nida-merchant-2-nida-merchant-1.jpg',
  'hamza-shah': 'https://evadxb.com/wp-content/uploads/hamza-1.jpg',
  'kairatbek-myrzabekov': 'https://evadxb.com/wp-content/uploads/kairats-photo-kairatbek-myrzabekov.jpeg',
  'viktoria-paradis': 'https://evadxb.com/wp-content/uploads/0000_group-12_0000_group-4.jpg',
  'anastasiya-kouzan': 'https://evadxb.com/wp-content/uploads/anastasia.jpg',
  'adilet-abylgaziev': 'https://evadxb.com/wp-content/uploads/0000_group-1.jpg',
  'elvira-sharshenalieva': 'https://evadxb.com/wp-content/uploads/elvira-11.png',
};

function getExtensionFromUrl(url: string): string {
  const parsed = new URL(url);
  const pathname = parsed.pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (ext && ext.length <= 6) return ext;
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

async function processAgent(
  agent: { id: string; slug: string; profile_image_url: string | null }
): Promise<{ updated: boolean; failed: boolean }> {
  const { id, slug, profile_image_url } = agent;

  if (profile_image_url && profile_image_url.includes(`${BUCKET_NAME}/`)) {
    return { updated: false, failed: false };
  }

  const sourceUrl = AGENT_IMAGE_MAP[slug];
  if (!sourceUrl) {
    console.error(`    No image URL mapping for agent: ${slug}`);
    return { updated: false, failed: true };
  }

  const ext = getExtensionFromUrl(sourceUrl);
  const storagePath = `agents/${slug}/profile${ext}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const buffer = await downloadImage(sourceUrl);
      const mimeType = getMimeType(ext);
      const success = await uploadImage(buffer, storagePath, mimeType);
      if (success) {
        const publicUrl = getPublicUrl(storagePath);
        const { error: updateError } = await supabase
          .from('agents')
          .update({ profile_image_url: publicUrl })
          .eq('id', id);

        if (updateError) {
          console.error(`    DB update failed for ${slug}: ${updateError.message}`);
          return { updated: false, failed: true };
        }

        console.log(`    Uploaded: ${storagePath}`);
        return { updated: true, failed: false };
      }
    } catch (err: any) {
      console.error(`    ${slug} attempt ${attempt} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        return { updated: false, failed: true };
      }
    }
  }

  return { updated: false, failed: true };
}

async function main() {
  console.log('=== Agent Images Upload Script ===');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Concurrency: ${CONCURRENCY}\n`);

  const { data: agents, error: fetchError } = await supabase
    .from('agents')
    .select('id, slug, profile_image_url')
    .order('slug');

  if (fetchError) {
    console.error('Failed to fetch agents:', fetchError.message);
    process.exit(1);
  }

  if (!agents || agents.length === 0) {
    console.log('No agents found.');
    return;
  }

  console.log(`Total agents: ${agents.length}\n`);

  const queue = [...agents];
  const active = new Set<Promise<void>>();
  let processed = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  while (queue.length > 0 || active.size > 0) {
    while (active.size < CONCURRENCY && queue.length > 0) {
      const agent = queue.shift()!;
      const promise = processAgent(agent).then(result => {
        processed++;
        totalUpdated += result.updated ? 1 : 0;
        totalFailed += result.failed ? 1 : 0;
        if (!result.updated && !result.failed) totalSkipped++;
        console.log(`[${processed}/${agents.length}] ${agent.slug} -> ${result.updated ? 'updated' : result.failed ? 'failed' : 'skipped'}`);
        active.delete(promise);
      }).catch(err => {
        processed++;
        console.error(`[${processed}/${agents.length}] ${agent.slug} -> fatal: ${err.message}`);
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
  console.log(`Total agents: ${agents.length}`);
  console.log(`Agents skipped (already on storage): ${totalSkipped}`);
  console.log(`Agents updated: ${totalUpdated}`);
  console.log(`Agents failed: ${totalFailed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
