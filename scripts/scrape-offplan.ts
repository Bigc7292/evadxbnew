import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const firecrawlApiKey = process.env.FIRECRAWL_API_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

const BASE_URL = 'https://evadxb.com/off-plan-properties';
const TOTAL_PAGES = 55;

const propertyUrls: string[] = [];

for (let page = 1; page <= TOTAL_PAGES; page++) {
  const pageUrl = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}/`;
  propertyUrls.push(pageUrl);
}

function httpsRequest(options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function scrapeUrl(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      url: url,
      formats: ['markdown'],
      onlyMainContent: true
    });

    const options = {
      hostname: 'api.firecrawl.dev',
      port: 443,
      path: '/v2/scrape',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.data && parsed.data.markdown) {
            resolve(parsed.data.markdown);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function extractPropertyUrls(markdown: string): string[] {
  const urls: string[] = [];
  const regex = /\[([^\]]+)\]\(https:\/\/evadxb\.com\/([^\/]+)\/\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const slug = match[2];
    if (slug && !slug.includes('off-plan-properties') && !slug.includes('page')) {
      urls.push(`https://evadxb.com/${slug}/`);
    }
  }
  return [...new Set(urls)];
}

function parsePropertyDetail(markdown: string, url: string): any {
  try {
    const titleMatch = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const priceMatch = markdown.match(/from\s+\$?([\d,]+(?:\.\d+)?)\s*[Km]?/i);
    const priceText = priceMatch ? priceMatch[1].replace(/,/g, '') : null;
    const price = priceText ? parseFloat(priceText) : null;
    const priceMin = price && priceText ? (priceText.includes('.') ? price : price * 1000000) : null;

    const descMatch = markdown.match(/About\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Amenities|IMPECCABLE|World-class|Project advantages|Convenient)/i);
    const description = descMatch ? descMatch[1].trim().replace(/\n+/g, ' ').trim() : '';

    const shortDescMatch = markdown.match(/^#\s+.+?\n\n(.+?)(?:\n\n|$)/m);
    const shortDescription = shortDescMatch ? shortDescMatch[1].trim() : description.slice(0, 300);

    const amenityRegex = /(?:Amenities|IMPECCABLE AMENITIES|World-class amenities|Project advantages)\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Strategic|Convenient|Layout|Payment|Get prices)/i;
    const amenityMatch = markdown.match(amenityRegex);
    const amenities: string[] = [];
    if (amenityMatch) {
      const amenityItems = amenityMatch[1].match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+&\s+[A-Z][a-z]+)*/g);
      if (amenityItems) {
        amenities.push(...amenityItems.filter(a => a.length > 3 && !a.includes('http')));
      }
    }

    const locationRegex = /(?:Strategic location|Convenient location)\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Layout|Payment|Get prices|Project video)/i;
    const locationMatch = markdown.match(locationRegex);
    const nearbyPlaces: string[] = [];
    if (locationMatch) {
      const places = locationMatch[1].match(/(\d+\s+minutes?\s+to\s+.+?)(?:\n|$)/gi);
      if (places) {
        nearbyPlaces.push(...places.map(p => p.trim()));
      }
    }

    const paymentRegex = /(?:CONVENIENT PAYMENT PLAN|Perfect Payment Plan|Payment Plan)\s*\n\n([\s\S]*?)(?:\n\n[A-Z]|Get prices|Why Dubai|About the developer)/i;
    const paymentMatch = markdown.match(paymentRegex);
    let paymentPlan = null;
    if (paymentMatch) {
      const rows = paymentMatch[1].matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);
      const cells: string[] = [];
      for (const row of rows) {
        cells.push(row[1].trim(), row[2].trim());
      }
      if (cells.length >= 6) {
        paymentPlan = {
          down_payment: parseInt(cells[0]) || 0,
          during_construction: parseInt(cells[2]) || 0,
          on_handover: parseInt(cells[4]) || 0
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
    const galleryImages = uniqueImages.slice(1, 11);

    const mapsMatch = markdown.match(/https:\/\/maps\.googleapis\.com\/maps\/api\/js\/StaticMapService\.GetMapImage\?([^)]+)/);
    const googleMapsEmbed = mapsMatch ? mapsMatch[0] : null;

    let latitude = null;
    let longitude = null;
    if (mapsMatch) {
      const url = new URL(mapsMatch[0]);
      const iParam = url.searchParams.get('1i');
      const jParam = url.searchParams.get('2i');
      if (iParam && jParam) {
        const { latLngFromTile } = require('./map-utils');
        const coords = latLngFromTile(parseInt(iParam), parseInt(jParam), 11);
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    const slug = url.replace('https://evadxb.com/', '').replace(/\/$/, '');
    const propertyType = /villa|townhouse|penthouse|studio|commercial|land/i.test(title) 
      ? title.toLowerCase().match(/(villa|townhouse|penthouse|studio|commercial|land)/i)?.[1]?.toLowerCase() || 'apartment'
      : 'apartment';

    const developerMatch = title.match(/\b(DAMAC|Emaar|Meraas|Nakheel|Sobha|Select Group|Binghatti|Ellington|Danube|Nshama|Aldar|Object1|Reportage|Tiger|Deyaar|Omniyat|EMAAR|MAG|Samana|Prestige One|Acube|Condor|Divine One|Segrex|DHG|Arista|Bentley|R\.Evolution|Meraki|Tabeer|SRG|OCTA|Merass|DarGlobal|AHS|IGO|DevMark)\b/i);
    const developer = developerMatch ? developerMatch[1] : 'EVA Real Estate';

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
      developer: developer,
      project_name: title,
      area_name: 'Dubai',
      community: 'Dubai',
      city: 'Dubai',
      country: 'UAE',
      features: amenities,
      amenities: amenities,
      nearby_places: nearbyPlaces,
      featured_image: featuredImage,
      gallery_images: galleryImages,
      video_url: null,
      virtual_tour_url: null,
      google_maps_embed_url: googleMapsEmbed,
      latitude: latitude,
      longitude: longitude,
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

async function main() {
  console.log('🚀 Starting off-plan property import...');
  
  const allPropertyUrls: string[] = [];
  
  console.log('📄 Scraping listing pages...');
  for (let i = 0; i < propertyUrls.length; i++) {
    const pageUrl = propertyUrls[i];
    console.log(`  Scraping page ${i + 1}/${propertyUrls.length}: ${pageUrl}`);
    
    const markdown = await scrapeUrl(pageUrl);
    if (markdown) {
      const urls = extractPropertyUrls(markdown);
      allPropertyUrls.push(...urls);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const uniqueUrls = [...new Set(allPropertyUrls)];
  console.log(`\n✅ Found ${uniqueUrls.length} unique property URLs`);

  const outputPath = path.join(__dirname, '../data/off-plan-properties.json');
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const properties: any[] = [];
  console.log('\n🏠 Scraping property details...');
  
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    console.log(`  [${i + 1}/${uniqueUrls.length}] ${url}`);
    
    const markdown = await scrapeUrl(url);
    if (markdown) {
      const property = parsePropertyDetail(markdown, url);
      if (property) {
        properties.push(property);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Parsed ${properties.length} properties`);

  fs.writeFileSync(outputPath, JSON.stringify(properties, null, 2));
  console.log(`\n💾 Saved to ${outputPath}`);

  console.log('\n📊 Importing to Supabase...');
  let imported = 0;
  let failed = 0;

  for (const property of properties) {
    const { error } = await supabase
      .from('properties')
      .upsert(property, { onConflict: 'slug' });
    
    if (error) {
      console.error(`  ❌ Failed to import ${property.slug}:`, error.message);
      failed++;
    } else {
      imported++;
    }
  }

  console.log(`\n✅ Import complete: ${imported} imported, ${failed} failed`);
}

main().catch(console.error);
