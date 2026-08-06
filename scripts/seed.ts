import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { GlobSync } from 'glob';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Helper functions
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractPrice(text: string): { min: number | null; max: number | null } {
  const matches = text.match(/\$?([\d,]+(?:\.\d+)?)\s*[KM]?/g);
  if (!matches) return { min: null, max: null };
  
  const prices = matches.map(m => parseFloat(m.replace(/[$,KM]/g, '').replace(/,/g, '')));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function extractNumber(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function mapPropertyType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('villa')) return 'villa';
  if (t.includes('townhouse')) return 'townhouse';
  if (t.includes('penthouse')) return 'penthouse';
  if (t.includes('studio')) return 'studio';
  if (t.includes('commercial')) return 'commercial';
  if (t.includes('land')) return 'land';
  return 'apartment';
}

function extractDeveloper(title: string): string {
  if (title.toLowerCase().includes('damac')) return 'DAMAC Properties';
  if (title.toLowerCase().includes('emaar')) return 'Emaar Properties';
  if (title.toLowerCase().includes('meraas')) return 'Meraas';
  if (title.toLowerCase().includes('nakheel')) return 'Nakheel';
  if (title.toLowerCase().includes('sobha')) return 'Sobha Realty';
  if (title.toLowerCase().includes('select group')) return 'Select Group';
  return 'EVA Real Estate';
}

function extractArea(title: string): string {
  if (title.toLowerCase().includes('dubai investment park')) return 'Dubai Investment Park';
  if (title.toLowerCase().includes('city walk')) return 'City Walk';
  if (title.toLowerCase().includes('the valley')) return 'The Valley';
  if (title.toLowerCase().includes('palm jebel ali')) return 'Palm Jebel Ali';
  if (title.toLowerCase().includes('business bay')) return 'Business Bay';
  if (title.toLowerCase().includes('dubai marina')) return 'Dubai Marina';
  if (title.toLowerCase().includes('downtown')) return 'Downtown Dubai';
  return 'Dubai';
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

// Parse scraped HTML files
async function parseScrapedData() {
  const scrapedDir = path.join(__dirname, '../../evadxb.com');
  const properties: any[] = [];
  const agents: any[] = [];
  const blogPosts: any[] = [];

  // Parse property landing pages
  const landingPages = [
    'riverside-views-by-damac.html',
    'city-walk-crestlane-by-meraas.html',
    'kaia-elea-elva-the-valley-by-emaar.html',
    'palm-jebel-ali-by-nakheel.html'
  ];

  for (const file of landingPages) {
    const filePath = path.join(scrapedDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const property = await parseLandingPage(html, file);
    if (property) properties.push(property);
  }

  // Parse listing pages
  const globber = new GlobSync('listing/*.html', { cwd: scrapedDir, nodir: true });
  const listingFiles = globber.found;
  for (const file of listingFiles) {
    const filePath = path.join(scrapedDir, file);
    const html = fs.readFileSync(filePath, 'utf-8');
    const property = await parseListingPage(html, file);
    if (property) properties.push(property);
  }

  // Parse agents
  const managersHtml = fs.readFileSync(path.join(scrapedDir, 'managers.html'), 'utf-8');
  const parsedAgents = parseAgents(managersHtml);
  agents.push(...parsedAgents);

  // Parse CEO
  const ceoHtml = fs.readFileSync(path.join(scrapedDir, 'elvira-sharshenalieva.html'), 'utf-8');
  const ceo = parseCEO(ceoHtml);
  if (ceo) agents.push(ceo);

  // Parse blog
  const blogHtml = fs.readFileSync(path.join(scrapedDir, 'blog.html'), 'utf-8');
  const posts = parseBlogList(blogHtml);
  blogPosts.push(...posts);

  // Parse about page for site config
  const aboutHtml = fs.readFileSync(path.join(scrapedDir, 'about-us.html'), 'utf-8');
  const siteConfig = parseSiteConfig(aboutHtml);

  return { properties, agents, blogPosts, siteConfig };
}

function parseLandingPage(html: string, filename: string) {
  try {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' &ndash; EVA Real Estate LLC', '') : filename;
    
    const descMatch = html.match(/<meta name="description" content="([^"]+)" \/>/);
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)" \/>/);
    const priceMatch = html.match(/from \$([\d,]+)/i);
    
    const aboutMatch = html.match(/<div class="about-landing__text content-text">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
    
    const galleryMatches = [...html.matchAll(/<img src="([^"]+)"[^>]*class="slider-landing__slide"[^>]*>/g)];
    const galleryImages = galleryMatches.map(m => m[1]);
    
    const amenityMatches = [...html.matchAll(/<div class="item-benefits-landing__name">([^<]+)<\/div>/g)];
    const amenities = amenityMatches.map(m => m[1].trim());
    
    const paymentMatch = html.match(/CONVENIENT PAYMENT PLAN([\s\S]*?)<\/table>/i);
    let paymentPlan = null;
    if (paymentMatch) {
      const rows = paymentMatch[1].matchAll(/<td[^>]*>([^<]+)<\/td>/g);
      const cells = Array.from(rows).map(m => m[1].trim());
      if (cells.length >= 6) {
        paymentPlan = {
          down_payment: parseInt(cells[0].replace('%', '')),
          during_construction: parseInt(cells[2].replace('%', '')),
          on_handover: parseInt(cells[4].replace('%', ''))
        };
      }
    }
    
    const locationMatches = [...html.matchAll(/<div class="features-landing__time">\s*<img[^>]*>\s*<div>([^<]+)<\/div>/g)];
    const nearbyPlaces = locationMatches.map(m => m[1].trim());
    
    const mapsMatch = html.match(/<iframe src="([^"]+)"[^>]*class="map-landing"[^>]*>/);
    
    const slug = slugify(title);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) * 1000000 : null;
    const developerName = extractDeveloper(title);
    
    return {
      slug,
      title,
      short_description: descMatch ? descMatch[1] : '',
      description: aboutMatch ? aboutMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '',
      property_type: 'apartment',
      listing_type: 'sale',
      status: 'secondary',
      price_min: price,
      price_max: price,
      price_currency: 'USD',
      bedrooms: null,
      bathrooms: null,
      area_sqft: null,
      developer: extractDeveloper(title),
      project_name: title,
      area_name: extractArea(title),
      features: amenities,
      amenities: amenities,
      nearby_places: nearbyPlaces,
      featured_image: ogImageMatch ? ogImageMatch[1] : null,
      gallery_images: galleryImages.slice(0, 10),
      video_url: null,
      virtual_tour_url: null,
      google_maps_embed_url: mapsMatch ? mapsMatch[1] : null,
      payment_plan: paymentPlan,
      is_featured: true,
      is_promoted: false,
      published_at: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error);
    return null;
  }
}

function parseListingPage(html: string, filename: string) {
  try {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' &ndash; EVA Real Estate LLC', '') : filename;
    
    const priceMatch = html.match(/class="price"[^>]*>([\s\S]*?)<\/div>/);
    let price = null;
    if (priceMatch) {
      const priceText = priceMatch[1];
      const priceNum = priceText.match(/[\d,]+/);
      if (priceNum) price = parseInt(priceNum[0].replace(/,/g, ''));
    }
    
    const detailsMatch = [...html.matchAll(/<li[^>]*>\s*<span[^>]*>([^<]+)<\/span>\s*<span[^>]*>([^<]+)<\/span>/g)];
    const details: Record<string, string> = {};
    for (const match of detailsMatch) {
      details[match[1].trim()] = match[2].trim();
    }
    
    const imgMatches = [...html.matchAll(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*wp-post-image[^"]*"[^>]*>/g)];
    const images = imgMatches.map(m => m[1]);
    
    const slug = slugify(title);
    
    return {
      slug,
      title,
      short_description: '',
      description: '',
      property_type: mapPropertyType(details['Type'] || details['Property Type'] || ''),
      listing_type: 'sale',
      status: 'secondary',
      price_min: price,
      price_max: price,
      price_currency: 'AED',
      bedrooms: extractNumber(details['Bedrooms'] || details['Beds'] || ''),
      bathrooms: extractNumber(details['Bathrooms'] || details['Baths'] || ''),
      area_sqft: extractNumber(details['Area'] || details['Size'] || ''),
      area_name: details['Location'] || '',
      community: details['Community'] || '',
      hero_image_url: images[0] || null,
      gallery_images: images.slice(1, 6),
      is_featured: false,
      is_promoted: false,
      published_at: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error parsing listing ${filename}:`, error);
    return null;
  }
}

function parseAgents(html: string) {
  const agents: any[] = [];
  const matches = [...html.matchAll(/<a href="\.\/managers\/([^\/]+)\/" class="managers_item">[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<div class="managers_name">([^<]+)<\/div>[\s\S]*?<div class="managers_position">([^<]+)<\/div>/g)];
  
  for (const match of matches) {
    const slug = match[1];
    const image = match[2];
    const name = match[3].trim();
    const position = match[4].trim();
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    agents.push({
      slug,
      first_name: firstName,
      last_name: lastName,
      position,
      profile_image_url: image,
      profile_image_alt: name,
      bio: `${position} at EVA Real Estate`,
      languages: ['English'],
      specializations: [position],
      is_active: true,
      is_leader: position.toLowerCase().includes('lead') || position.toLowerCase().includes('manager') || position.toLowerCase().includes('head'),
      years_experience: 5,
      created_at: new Date().toISOString()
    });
  }
  
  return agents;
}

function parseCEO(html: string) {
  try {
    const nameMatch = html.match(/<div class="tm-person-page__preview-title lightmedium size30">([^<]+)<\/div>/);
    const roleMatch = html.match(/<div class="tm-person-page__preview-title lightmedium light-shampan">([^<]+)<\/div>/);
    const imageMatch = html.match(/<img src="([^"]+)"[^>]*class="tm-person-page__preview-img"[^>]*>/);
    const bioMatch = html.match(/<div class="tm-person-page__text1 size30 dark-gray tm-margin-medium-bottom">\s*<p>([^<]+)<\/p>/);
    
    if (!nameMatch) return null;
    
    const name = nameMatch[1].trim();
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    return {
      slug: 'elvira-sharshenalieva',
      first_name: firstName,
      last_name: lastName,
      position: roleMatch ? roleMatch[1].trim() : 'CEO',
      profile_image_url: imageMatch ? imageMatch[1] : null,
      profile_image_alt: name,
      bio: bioMatch ? bioMatch[1] : 'Founder and CEO of EVA Real Estate',
      languages: ['English', 'Russian'],
      specializations: ['Leadership', 'Strategic Planning', 'Luxury Real Estate', 'Investment Advisory'],
      is_active: true,
      is_leader: true,
      years_experience: 10,
      total_sales_volume: 5000000000,
      properties_sold: 1000,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing CEO:', error);
    return null;
  }
}

function parseBlogList(html: string) {
  const posts: any[] = [];
  const matches = [...html.matchAll(/<div class="blogpage__item item-blog">[\s\S]*?<a href="\.\/([^\/]+)\/" class="item-blog__image">[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<div class="item-blog__date">([^<]+)<\/div>[\s\S]*?<a href="\.\/[^\/]+\/" class="item-blog__post-name">([^<]+)<\/a>[\s\S]*?<div class="item-blog__text">\s*<p>([^<]+)/g)];
  
  for (const match of matches) {
    const slug = match[1];
    const image = match[2];
    const dateStr = match[3].trim();
    const title = match[4].trim();
    const excerpt = match[5].trim().replace(/&hellip;/g, '...');
    
    const dateParts = dateStr.split('.');
    const publishedAt = dateParts.length === 3 
      ? new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`).toISOString()
      : new Date().toISOString();
    
    posts.push({
      slug,
      title,
      excerpt: excerpt.replace(/&hellip;/g, '...'),
      content: '',
      featured_image: image,
      featured_image_alt: title,
      category: 'Market Insights',
      tags: ['Dubai', 'Real Estate', 'Investment'],
      is_published: true,
      published_at: publishedAt,
      reading_time: 5,
      created_at: publishedAt,
      updated_at: publishedAt
    });
  }
  
  return posts;
}

function parseSiteConfig(html: string) {
  const phoneMatch = html.match(/href="tel:([^"]+)"/);
  const emailMatch = html.match(/href="mailto:([^"]+)"/);
  const addressMatch = html.match(/UAE, Dubai\. Dubai Marina,<br \/>([^<]+)<br \/>([^<]+)/);
  const hoursMatch = html.match(/Sun - Thu: ([^<]+)<br \/>Sat: ([^<]+)/);
  
  const socialMatches = {
    facebook: html.match(/href="https:\/\/www\.facebook\.com\/([^"]+)"/),
    instagram: html.match(/href="https:\/\/www\.instagram\.com\/([^"]+)"/),
    youtube: html.match(/href="https:\/\/www\.youtube\.com\/([^"]+)"/),
    linkedin: html.match(/href="https?:\/\/linkedin\.com\/company\/([^"]+)"/)
  };
  
  return {
    site_name: 'EVA Real Estate LLC',
    site_description: 'Luxury real estate agency in Dubai offering premium properties from top developers',
    contact_phone: phoneMatch ? `+${phoneMatch[1]}` : '+971 58 102 5758',
    contact_email: emailMatch ? emailMatch[1] : 'info@evadxb.com',
    contact_address: addressMatch ? `${addressMatch[1].trim()}, ${addressMatch[2].trim()}` : 'UAE, Dubai. Dubai Marina, Marina Plaza Building, Office 3501',
    working_hours: hoursMatch ? `Sun-Thu: ${hoursMatch[1]}, Sat: ${hoursMatch[2]}` : 'Sun - Thu: 9:30 - 18:00, Sat: 9:30 - 13:00',
    social_links: {
      facebook: socialMatches.facebook ? `https://www.facebook.com/${socialMatches.facebook[1]}` : 'https://www.facebook.com/evaestate.eu/',
      instagram: socialMatches.instagram ? `https://www.instagram.com/${socialMatches.instagram[1]}` : 'https://www.instagram.com/evaestate.eu/',
      youtube: socialMatches.youtube ? `https://www.youtube.com/${socialMatches.youtube[1]}` : 'https://www.youtube.com/channel/UCLTQobR6aWQkhHahJz86phQ',
      linkedin: socialMatches.linkedin ? `https://linkedin.com/company/${socialMatches.linkedin[1]}` : 'http://linkedin.com/company/evarealestate'
    }
  };
}

// Main seeding function
async function seedDatabase() {
  console.log('?? Starting database seeding...');
  
  try {
    // Parse scraped data
    console.log('?? Parsing scraped website data...');
    const { properties, agents, blogPosts, siteConfig } = await parseScrapedData();
    console.log(`   Found: ${properties.length} properties, ${agents.length} agents, ${blogPosts.length} blog posts`);
    
    // Seed site config
    console.log('?? Seeding site configuration...');
    for (const [key, value] of Object.entries(siteConfig)) {
      const { error } = await supabase
        .from('site_config')
        .upsert({ key, value, is_public: true }, { onConflict: 'key' });
      if (error) console.error(`Error seeding site_config ${key}:`, error);
    }
    
    // Seed agents
    console.log('?? Seeding agents...');
    for (const agent of agents) {
      const { error } = await supabase
        .from('agents')
        .upsert(agent, { onConflict: 'slug' });
      if (error) console.error(`Error seeding agent ${agent.slug}:`, error);
    }
    
    // Seed properties with developer/project resolution
    console.log('?? Seeding properties...');
    for (const property of properties) {
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
          price_currency: property.price_currency || 'AED',
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
        }, { onConflict: 'slug' });
      
      if (error) console.error(`Error seeding property ${property.slug}:`, error);
    }
    
    // Seed blog posts
    console.log('?? Seeding blog posts...');
    for (const post of blogPosts) {
      const { error } = await supabase
        .from('blog_posts')
        .upsert(post, { onConflict: 'slug' });
      if (error) console.error(`Error seeding blog post ${post.slug}:`, error);
    }
    
    console.log('? Database seeding completed!');
    
  } catch (error) {
    console.error('? Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase().catch(console.error);
