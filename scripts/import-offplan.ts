import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const firecrawlApiKey = process.env.FIRECRAWL_API_KEY || 'fc-0c031f0c21384ee18c2c82bd0e6654e3';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const BASE_LISTING_URL = 'https://evadxb.com/off-plan-properties';
const TOTAL_PAGES = 55;
const DELAY_MS = 500;
const BATCH_SIZE = 10;

const progressPath = path.join(__dirname, '../data/import-progress.json');
const dataPath = path.join(__dirname, '../data/offplan-scraped.json');
const dataDir = path.dirname(dataPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface Progress {
  scrapedUrls: string[];
  importedSlugs: string[];
  failedUrls: string[];
}

function loadProgress(): Progress {
  try {
    if (fs.existsSync(progressPath)) {
      return JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return { scrapedUrls: [], importedSlugs: [], failedUrls: [] };
}

function saveProgress(progress: Progress) {
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

function loadScrapedData(): any[] {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return [];
}

function saveScrapedData(data: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

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

function extractPropertyUrls(markdown: string): string[] {
  const urls: string[] = [];
  const regex = /\]\(https:\/\/evadxb\.com\/([^\/\s)]+)\/\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const slug = match[1];
    if (slug && 
        !slug.includes('off-plan-properties') && 
        !slug.includes('page') &&
        !slug.includes('wp-content') &&
        !slug.includes('icons') &&
        !slug.includes('maps.googleapis')) {
      urls.push(`https://evadxb.com/${slug}/`);
    }
  }
  return [...new Set(urls)];
}

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
    const i = parsed.searchParams.get('1i');
    const j = parsed.searchParams.get('2i');
    if (i && j) {
      const coords = latLngFromTile(parseInt(i), parseInt(j), 11);
      return { lat: coords.lat, lng: coords.lng };
    }
  } catch {
    // ignore
  }
  return { lat: null, lng: null };
}

function parsePriceValue(text: string): number | null {
  const cleaned = text.replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  
  if (text.toLowerCase().includes('m') && !text.toLowerCase().includes('million')) {
    return num * 1000000;
  }
  if (text.toLowerCase().includes('million')) {
    return num * 1000000;
  }
  if (text.toLowerCase().includes('k')) {
    return num * 1000;
  }
  return num;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePropertyDetail(markdown: string, url: string): any {
  try {
    const titleMatch = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const pricePatterns = [
      /from\s+\$?([\d,]+(?:\.\d+)?)\s*[MmKk]?(?:\s+|$)/i,
      /\$\s*([\d,]+(?:\.\d+)?)\s*[MmKk]?(?:\s+|$)/i,
      /from\s+([\d,]+(?:\.\d+)?)\s*[MmKk]?(?:\s+|$)/i
    ];
    
    let priceMin = null;
    for (const pattern of pricePatterns) {
      const match = markdown.match(pattern);
      if (match) {
        priceMin = parsePriceValue(match[1]);
        if (priceMin) break;
      }
    }

    const descMatch = markdown.match(/About\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Amenities|IMPECCABLE|World-class|Project advantages|Convenient|Layout)/i);
    const description = descMatch ? descMatch[1].trim().replace(/\n+/g, ' ').trim() : '';

    const shortDescMatch = markdown.match(/^#\s+.+?\n\n(.+?)(?:\n\n|$)/m);
    const shortDescription = shortDescMatch ? shortDescMatch[1].trim() : description.slice(0, 300);

    const amenitySectionMatch = markdown.match(/(?:Amenities|IMPECCABLE AMENITIES|World-class amenities|Project advantages)\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Strategic|Convenient|Layout|Payment|Get prices)/i);
    const amenities: string[] = [];
    if (amenitySectionMatch) {
      const lines = amenitySectionMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.trim();
        if (cleaned && 
            !cleaned.includes('http') && 
            !cleaned.includes('!') &&
            cleaned.length > 3 &&
            cleaned.length < 50 &&
            /^[A-Z]/.test(cleaned)) {
          amenities.push(cleaned);
        }
      }
    }

    const locationSectionMatch = markdown.match(/(?:Strategic location|Convenient location)\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Layout|Payment|Get prices|Project video)/i);
    const nearbyPlaces: string[] = [];
    if (locationSectionMatch) {
      const places = locationSectionMatch[1].match(/(\d+\s+minutes?\s+to\s+.+?)(?:\n|$)/gi);
      if (places) {
        nearbyPlaces.push(...places.map(p => p.trim()));
      }
    }

    const paymentSectionMatch = markdown.match(/(?:CONVENIENT PAYMENT PLAN|Perfect Payment Plan|Payment Plan)\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Get prices|Why Dubai|About the developer)/i);
    let paymentPlan = null;
    if (paymentSectionMatch) {
      const rows = [...paymentSectionMatch[1].matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g)];
      if (rows.length >= 3) {
        paymentPlan = {
          down_payment: parseInt(rows[0][1].trim()) || 0,
          during_construction: parseInt(rows[1][1].trim()) || 0,
          on_handover: parseInt(rows[2][1].trim()) || 0
        };
      }
    }

    const imageRegex = /!\[\s*\]\(([^)]+)\)/g;
    const images: string[] = [];
    let imgMatch;
    while ((imgMatch = imageRegex.exec(markdown)) !== null) {
      const imgUrl = imgMatch[1];
      if (imgUrl.includes('evadxb.com/wp-content/uploads/') && !imgUrl.includes('icons/')) {
        images.push(imgUrl);
      }
    }
    const uniqueImages = [...new Set(images)];

    const featuredImage = uniqueImages[0] || null;
    const galleryImages = uniqueImages.slice(1);

    const videoRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|vimeo\.com\/|dailymotion\.com\/video\/|player\.vimeo\.com\/video\/|evadxb\.com\/wp-content\/uploads\/.*\.(?:mp4|webm|mov|avi|m3u8))/i;
    const videoMatch = markdown.match(videoRegex);
    const videoUrl = videoMatch ? videoMatch[0] : null;

    const mapsMatch = markdown.match(/https:\/\/maps\.googleapis\.com\/maps\/api\/js\/StaticMapService\.GetMapImage\?[^\s)]+/);
    const googleMapsEmbed = mapsMatch ? mapsMatch[0] : null;
    const coords = extractCoordsFromMapsUrl(googleMapsEmbed);

    const slug = url.replace('https://evadxb.com/', '').replace(/\/$/, '');

    const propertyTypeMap: Record<string, string> = {
      'villa': 'villa',
      'townhouse': 'townhouse',
      'penthouse': 'penthouse',
      'studio': 'studio',
      'commercial': 'commercial',
      'land': 'land'
    };
    const lowerTitle = title.toLowerCase();
    let propertyType = 'apartment';
    for (const [type, value] of Object.entries(propertyTypeMap)) {
      if (lowerTitle.includes(type)) {
        propertyType = value;
        break;
      }
    }

    const developerPatterns: Record<string, string> = {
      'damac': 'DAMAC Properties',
      'emaar': 'Emaar Properties',
      'meraas': 'Meraas',
      'nakheel': 'Nakheel',
      'sobha': 'Sobha Realty',
      'select group': 'Select Group',
      'binghatti': 'Binghatti Developers',
      'ellington': 'Ellington Properties',
      'danube': 'Danube Properties',
      'nshama': 'Nshama',
      'aldar': 'Aldar Properties',
      'object1': 'Object One',
      'reportage': 'Reportage Properties',
      'tiger': 'Tiger Properties',
      'deyaar': 'Deyaar',
      'omniyat': 'Omniyat',
      'mag': 'MAG Properties',
      'samana': 'Samana Properties',
      'prestige one': 'Prestige One',
      'acube': 'Acube Developments',
      'condor': 'Condor Developments',
      'divine one': 'Divine One Group',
      'segrex': 'Segrex Development',
      'dhg': 'DHG Properties',
      'arista': 'Arista Properties',
      'bentley': 'Bentley Home',
      'r.evolution': 'R.Evolution',
      'meraki': 'Meraki Developers',
      'tabeer': 'Tabeer Development',
      'srg': 'SRG',
      'octa': 'OCTA Properties',
      'merass': 'Meraas',
      'darglobal': 'DarGlobal',
      'ahs': 'AHS Properties',
      'igo': 'IGO',
      'devmark': 'DevMark'
    };

    let developer = 'EVA Real Estate';
    const lowerTitleForDev = lowerTitle;
    for (const [pattern, devName] of Object.entries(developerPatterns)) {
      if (lowerTitleForDev.includes(pattern)) {
        developer = devName;
        break;
      }
    }

    return {
      slug,
      title,
      short_description: shortDescription || '',
      description: description || '',
      property_type: propertyType,
      listing_type: 'sale',
      status: 'off_plan',
      price_min: priceMin,
      price_max: priceMin,
      price_currency: 'USD',
      bedrooms: null,
      bathrooms: null,
      area_sqft: null,
      developer_name: developer,
      project_name: title,
      area_name: 'Dubai',
      community: 'Dubai',
      city: 'Dubai',
      country: 'UAE',
      features: amenities,
      amenities: amenities,
      nearby_places: nearbyPlaces,
      hero_image_url: featuredImage,
      gallery_images: galleryImages,
      video_url: videoUrl,
      virtual_tour_url: null,
      google_maps_embed_url: googleMapsEmbed,
      latitude: coords.lat,
      longitude: coords.lng,
      payment_plan: paymentPlan,
      is_featured: true,
      is_promoted: false,
      published_at: new Date().toISOString(),
      external_source: 'evadxb.com',
      external_id: slug
    };
  } catch (error) {
    console.error(`Error parsing property ${url}:`, error);
    return null;
  }
}

async function scrapeListingPages(): Promise<string[]> {
  const allUrls: string[] = [];
  
  console.log('?? Scraping listing pages...');
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const pageUrl = page === 1 ? BASE_LISTING_URL : `${BASE_LISTING_URL}/page/${page}/`;
    console.log(`  Page ${page}/${TOTAL_PAGES}`);
    
    const markdown = await scrapeUrl(pageUrl);
    if (markdown) {
      const urls = extractPropertyUrls(markdown);
      allUrls.push(...urls);
    }
    
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  return [...new Set(allUrls)];
}

async function scrapePropertyDetails(urls: string[], progress: Progress): Promise<any[]> {
  const properties: any[] = [];
  const existingData = loadScrapedData();
  const dataMap = new Map(existingData.map(p => [p.slug, p]));
  
  console.log(`\n?? Scraping ${urls.length} property details...`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = url.replace('https://evadxb.com/', '').replace(/\/$/, '');
    
    if (progress.scrapedUrls.includes(url)) {
      continue;
    }
    
    console.log(`  [${i + 1}/${urls.length}] ${slug}`);
    
    const markdown = await scrapeUrl(url);
    if (markdown) {
      const property = parsePropertyDetail(markdown, url);
      if (property) {
        properties.push(property);
        dataMap.set(slug, property);
      }
      progress.scrapedUrls.push(url);
    } else {
      progress.failedUrls.push(url);
    }
    
    saveProgress(progress);
    saveScrapedData(Array.from(dataMap.values()));
    
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  return properties;
}

async function resolveDeveloperId(name: string): Promise<string | null> {
  if (!name) return null;
  const { data: existing } = await supabase
    .from('developers')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from('developers')
    .insert({ name, slug: slugify(name), is_active: true })
    .select('id')
    .single();

  return created?.id ?? null;
}

async function resolveProjectId(name: string, developerId: string | null): Promise<string | null> {
  if (!name) return null;
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from('projects')
    .insert({ name, slug: slugify(name), developer_id: developerId, is_active: true })
    .select('id')
    .single();

  return created?.id ?? null;
}

async function importToSupabase(properties: any[], progress: Progress): Promise<void> {
  console.log('\n?? Importing to Supabase...');
  let imported = 0;
  let failed = 0;

  for (const property of properties) {
    if (progress.importedSlugs.includes(property.slug)) {
      continue;
    }

    const developerId = await resolveDeveloperId(property.developer_name || property.developer || 'EVA Real Estate');
    const projectId = await resolveProjectId(property.project_name, developerId);

    const { error } = await supabase
      .from('properties')
      .upsert({
        slug: property.slug,
        title: property.title,
        description: property.description,
        short_description: property.short_description,
        property_type: property.property_type,
        listing_type: property.listing_type,
        status: property.status,
        price_min: property.price_min,
        price_max: property.price_max,
        price_currency: property.price_currency || 'USD',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area_sqft,
        address: property.address,
        area_name: property.area_name,
        community: property.community,
        city: property.city || 'Dubai',
        country: property.country || 'UAE',
        latitude: property.latitude,
        longitude: property.longitude,
        features: property.features || [],
        amenities: property.amenities || [],
        nearby_places: property.nearby_places || [],
        hero_image_url: property.hero_image_url || property.featured_image,
        gallery_images: property.gallery_images || [],
        floor_plan_images: property.floor_plans || [],
        video_url: property.video_url,
        virtual_tour_url: property.virtual_tour_url,
        google_maps_embed_url: property.google_maps_embed_url,
        developer_id: developerId,
        project_id: projectId,
        project_name: property.project_name,
        payment_plan: property.payment_plan,
        is_featured: property.is_featured,
        is_promoted: property.is_promoted,
        published_at: property.published_at,
        external_source: property.external_source,
        external_id: property.external_id,
      }, { onConflict: 'slug' });
    
    if (error) {
      console.error(`  ? Failed: ${property.slug}:`, error.message);
      failed++;
    } else {
      imported++;
      progress.importedSlugs.push(property.slug);
    }
  }

  saveProgress(progress);
  console.log(`\n? Import complete: ${imported} imported, ${failed} failed`);
}

async function main() {
  console.log('?? Starting off-plan property import...\n');
  
  const progress = loadProgress();
  console.log(`?? Progress: ${progress.scrapedUrls.length} scraped, ${progress.importedSlugs.length} imported`);

  const allPropertyUrls = await scrapeListingPages();
  console.log(`\n? Found ${allPropertyUrls.length} unique property URLs`);

  const properties = await scrapePropertyDetails(allPropertyUrls, progress);
  console.log(`\n? Scraped ${properties.length} new properties`);

  const allScraped = loadScrapedData();
  await importToSupabase(allScraped, progress);

  console.log('\n?? Done!');
}

main().catch(console.error);
