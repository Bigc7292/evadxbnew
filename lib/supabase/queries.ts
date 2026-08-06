import { createClient } from '@supabase/supabase-js';
import { normalizePropertyPrice } from '@/lib/utils';
import { createCacheKey, getCached, setCached } from '@/lib/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Property = {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  price_min: number | null;
  price_max: number | null;
  price_currency: string;
  property_type: 'apartment' | 'villa' | 'townhouse' | 'penthouse' | 'studio' | 'commercial' | 'land';
  status: 'off_plan' | 'ready' | 'under_construction' | 'active' | 'pending' | 'sold' | 'rented' | 'off_market' | 'draft';
  listing_type: 'sale' | 'rent' | 'both';
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  address: string | null;
  area_name: string | null;
  community: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_embed_url: string | null;
  developer_id: string | null;
  project_id: string | null;
  project_name: string | null;
  features: string[];
  amenities: string[];
  nearby_places: string[];
  hero_image_url: string | null;
  gallery_images: string[];
  floor_plan_images: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  payment_plan: PaymentPlan | null;
  is_featured: boolean;
  is_promoted: boolean;
  views_count: number;
  agent_id: string | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  // Backward-compatible aliases for UI components
  price?: number | null;
  currency?: string;
  price_type?: 'sale' | 'rent';
  area?: string | null;
  developer?: string;
  featured_image?: string | null;
  images?: string[];
  floor_plans?: string[];
  google_maps_embed?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  location?: string | null;
};

export type Agent = {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  position: string;
  bio: string;
  short_bio: string | null;
  profile_image_url: string | null;
  profile_image_alt: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  languages: string[];
  specializations: string[];
  areas_covered: string[];
  social_links: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
  is_leader: boolean;
  is_active: boolean;
  sort_order: number | null;
  rera_license_number: string | null;
  rera_license_expiry: string | null;
  years_experience: number | null;
  total_sales_volume: number | null;
  properties_sold: number | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeAgent(a: any): Agent {
  if (!a) return a;
  const profileImage = a.profile_image_url ?? null;
  const normalizedProfileImage = normalizeImageUrl(profileImage);
  return {
    ...a,
    first_name: a.first_name ?? '',
    last_name: a.last_name ?? '',
    position: a.position ?? '',
    bio: a.bio ?? '',
    short_bio: a.short_bio ?? null,
    profile_image_url: normalizedProfileImage,
    profile_image_alt: a.profile_image_alt ?? null,
    email: a.email ?? null,
    phone: a.phone ?? null,
    whatsapp: a.whatsapp ?? null,
    languages: a.languages ?? [],
    specializations: a.specializations ?? [],
    areas_covered: a.areas_covered ?? [],
    social_links: a.social_links ?? {},
    is_leader: a.is_leader ?? false,
    is_active: a.is_active ?? true,
    sort_order: a.sort_order ?? null,
    rera_license_number: a.rera_license_number ?? null,
    rera_license_expiry: a.rera_license_expiry ?? null,
    years_experience: a.years_experience ?? null,
    total_sales_volume: a.total_sales_volume ?? null,
    properties_sold: a.properties_sold ?? null,
    meta_title: a.meta_title ?? null,
    meta_description: a.meta_description ?? null,
  };
}

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('./')) return 'https://evadxb.com/' + trimmed.slice(2);
  return null;
}

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  content_html: string | null;
  featured_image: string;
  hero_image_alt: string | null;
  gallery_images: string[];
  author_id: string | null;
  author_name: string | null;
  author_role: string | null;
  category: string;
  tags: string[];
  published_at: string | null;
  is_published: boolean;
  is_featured: boolean;
  scheduled_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  reading_time: number | null;
  views_count: number;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  message: string;
  source: string;
  source_page: string | null;
  property_id: string | null;
  project_id: string | null;
  agent_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  google_id: string | null;
  yandex_id: string | null;
  fb_pixel_id: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'viewing' | 'offer' | 'closed_won' | 'closed_lost' | 'spam';
  priority: number;
  assigned_to: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentPlan = {
  down_payment: number;
  during_construction: number;
  on_handover: number;
  installments?: number;
};

export type SiteConfig = {
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  working_hours: string;
  social_links: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  seo: {
    default_title: string;
    default_description: string;
    og_image: string;
  };
  features: {
    chatbot_enabled: boolean;
    voice_chat_enabled: boolean;
    multilingual_enabled: boolean;
    wishlist_enabled: boolean;
  };
};

export type Developer = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  developer_id: string | null;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'active' | 'completed' | 'cancelled' | 'on_hold';
  start_date: string | null;
  completion_date: string | null;
  payment_plan: PaymentPlan | null;
  features: string[];
  amenities: string[];
  hero_image_url: string | null;
  gallery_images: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  is_featured: boolean;
  is_promoted: boolean;
  created_at: string;
  updated_at: string;
};

export type District = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  district_type: 'city' | 'district' | 'community' | 'neighborhood';
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ChatSession = {
  id: string;
  session_token: string;
  user_id: string | null;
  language: string;
  ip_address: string | null;
  user_agent: string | null;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  is_resolved: boolean;
  lead_id: string | null;
  metadata: Record<string, any>;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: string | null;
  sentiment: string | null;
  intent: string | null;
  entities: any[];
  tool_calls: any[];
  created_at: string;
};

export type Wishlist = {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
};

export type Partner = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Reward = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  points_required: number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  terms_conditions: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentBlock = {
  id: string;
  page: string;
  section: string;
  locale: string;
  content: Record<string, any>;
  sort_order: number;
  is_published: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  property_id: string | null;
  agent_id: string | null;
  user_name: string;
  user_email: string | null;
  rating: number;
  title: string | null;
  content: string;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  bucket: string;
  path: string;
  url: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type PropertyView = {
  id: string;
  property_id: string;
  viewer_ip: string | null;
  session_id: string | null;
  user_id: string | null;
  referrer: string | null;
  page_url: string | null;
  device_type: string | null;
  country_code: string | null;
  created_at: string;
};

export type SyncLog = {
  id: string;
  source: 'scraper' | 'goyzer' | 'woocommerce' | 'manual';
  status: 'started' | 'completed' | 'failed' | 'partial';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
};

export type Notification = {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type Comparison = {
  id: string;
  session_id: string;
  property_ids: string[];
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: 'open_house' | 'webinar' | 'virtual_tour' | 'exhibition';
  property_id: string | null;
  start_at: string;
  end_at: string;
  location: string | null;
  meeting_url: string | null;
  max_attendees: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  user_name: string;
  user_title: string | null;
  user_image_url: string | null;
  content: string;
  rating: number;
  property_id: string | null;
  agent_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function normalizeProperty(p: any): Property {
  if (!p) return p;
  const lat = p.latitude ?? null;
  const lng = p.longitude ?? null;
  const country = (p.country || '').toLowerCase();
  const city = (p.city || '').toLowerCase();
  const isUAE = country === 'uae' || city === 'dubai' || city === 'abu dhabi';
  const currency = isUAE ? 'AED' : (p.price_currency ?? p.currency ?? 'USD');
  const rawPrice = p.price_min ?? p.price_max ?? null;
  const normalizedPrice = normalizePropertyPrice(rawPrice, currency);

  const normalizeArray = (items: any[]): string[] => {
    if (!Array.isArray(items)) return [];
    return items.map(normalizeImageUrl).filter((url): url is string => url !== null);
  };

  const location = p.location ?? ([p.address, p.community, p.city, p.country].filter(Boolean).join(', ') || '');
  const area_name = p.area_name ?? null;
  const area = p.area_name ?? p.community ?? p.city ?? '';

  return {
    ...p,
    price_min: p.price_min ?? null,
    price_max: p.price_max ?? null,
    price_currency: currency,
    developer: p.developer ?? p.project_name ?? '',
    developer_id: p.developer_id ?? null,
    project_id: p.project_id ?? null,
    project_name: p.project_name ?? null,
    hero_image_url: normalizeImageUrl(p.hero_image_url ?? null),
    featured_image: normalizeImageUrl(p.hero_image_url ?? null),
    gallery_images: normalizeArray(p.gallery_images),
    images: normalizeArray(p.gallery_images),
    floor_plan_images: normalizeArray(p.floor_plan_images),
    floor_plans: normalizeArray(p.floor_plan_images),
    google_maps_embed_url: p.google_maps_embed_url ?? null,
    google_maps_embed: p.google_maps_embed_url ?? null,
    coordinates: lat != null && lng != null ? { lat, lng } : null,
    location,
    area_name,
    area,
    views_count: p.views_count ?? 0,
    agent_id: p.agent_id ?? null,
    completion_date: p.completion_date ?? null,
    price: normalizedPrice,
    currency,
    price_type: p.listing_type ?? 'sale',
  };
}

export async function getPropertyBySlug(slug: string) {
  const cacheKey = createCacheKey(['property', slug]);
  const cached = getCached<Property>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  const result = normalizeProperty(data) as Property;
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getProperties(filters?: {
  property_type?: string;
  listing_type?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  limit?: number;
  offset?: number;
  featured_only?: boolean;
  search?: string;
  furnishing?: string;
  tenancy?: string;
  view_type?: string;
  ownership?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'area';
}) {
  const cacheKey = createCacheKey(['properties', filters]);
  const cached = getCached<{ properties: Property[]; totalCount: number }>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  if (filters?.sort_by === 'price_asc') {
    query = query.order('price_min', { ascending: true });
  } else if (filters?.sort_by === 'price_desc') {
    query = query.order('price_max', { ascending: false });
  } else if (filters?.sort_by === 'area') {
    query = query.order('area_sqft', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (filters?.property_type) {
    query = query.eq('property_type', filters.property_type);
  }
  if (filters?.listing_type) {
    query = query.eq('listing_type', filters.listing_type);
  }
  if (filters?.location) {
    query = query.or(`area_name.ilike.%${filters.location}%,community.ilike.%${filters.location}%,city.ilike.%${filters.location}%`);
  }
  if (filters?.min_price) {
    query = query.gte('price_min', filters.min_price);
  }
  if (filters?.max_price) {
    query = query.lte('price_max', filters.max_price);
  }
  if (filters?.min_area) {
    query = query.gte('area_sqft', filters.min_area);
  }
  if (filters?.max_area) {
    query = query.lte('area_sqft', filters.max_area);
  }
  if (filters?.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms);
  }
  if (filters?.bathrooms) {
    query = query.gte('bathrooms', filters.bathrooms);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(`title.ilike.${term},area_name.ilike.${term},project_name.ilike.${term},city.ilike.${term}`);
  }
  if (filters?.furnishing) {
    query = query.contains('features', [filters.furnishing]);
  }
  if (filters?.tenancy) {
    query = query.contains('features', [filters.tenancy]);
  }
  if (filters?.view_type) {
    query = query.contains('features', [filters.view_type]);
  }
  if (filters?.ownership) {
    query = query.contains('features', [filters.ownership]);
  }
  if (filters?.featured_only) {
    query = query.eq('is_featured', true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  const result = { properties: (data ?? []).map(normalizeProperty) as Property[], totalCount: count ?? 0 };
  setCached(cacheKey, result, 30 * 1000);
  return result;
}

export async function getAgents(filters?: {
  team_leads_only?: boolean;
  limit?: number;
}) {
  const cacheKey = createCacheKey(['agents', filters]);
  const cached = getCached<Agent[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('agents')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (filters?.team_leads_only) {
    query = query.eq('is_leader', true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []).map(normalizeAgent) as Agent[];
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getAgentBySlug(slug: string) {
  const cacheKey = createCacheKey(['agent', slug]);
  const cached = getCached<Agent>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  const result = normalizeAgent(data) as Agent;
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getBlogPosts(filters?: {
  category?: string;
  published_only?: boolean;
  limit?: number;
  offset?: number;
}) {
  const cacheKey = createCacheKey(['blog_posts', filters]);
  const cached = getCached<BlogPost[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.published_only) {
    query = query.eq('is_published', true).not('published_at', 'is', null);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = data as BlogPost[];
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getBlogPostBySlug(slug: string) {
  const cacheKey = createCacheKey(['blog_post', slug]);
  const cached = getCached<BlogPost>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  const result = data as BlogPost;
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getSiteConfig() {
  const cacheKey = createCacheKey(['site_config']);
  const cached = getCached<SiteConfig>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('site_config')
    .select('*')
    .single();

  if (error) throw error;
  const result = data as SiteConfig;
  setCached(cacheKey, result, 5 * 60 * 1000);
  return result;
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...lead,
      status: 'new',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function getDevelopers(filters?: { limit?: number; active_only?: boolean }) {
  const cacheKey = createCacheKey(['developers', filters]);
  const cached = getCached<Developer[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('developers')
    .select('*')
    .order('name', { ascending: true });

  if (filters?.active_only) {
    query = query.eq('is_active', true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []) as Developer[];
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getProjects(filters?: { developer_id?: string; status?: string; limit?: number }) {
  const cacheKey = createCacheKey(['projects', filters]);
  const cached = getCached<Project[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('projects')
    .select('*')
    .order('name', { ascending: true });

  if (filters?.developer_id) {
    query = query.eq('developer_id', filters.developer_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []) as Project[];
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getPartners(filters?: { category?: string; active_only?: boolean; limit?: number }) {
  const cacheKey = createCacheKey(['partners', filters]);
  const cached = getCached<Partner[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('partners')
    .select('*')
    .order('sort_order', { ascending: true });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.active_only) {
    query = query.eq('is_active', true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []) as Partner[];
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getRewards(filters?: { active_only?: boolean; limit?: number }) {
  const cacheKey = createCacheKey(['rewards', filters]);
  const cached = getCached<Reward[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('rewards')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.active_only) {
    query = query.eq('is_active', true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []) as Reward[];
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getContentBlocks(page: string, section: string, locale = 'en') {
  const cacheKey = createCacheKey(['content_blocks', page, section, locale]);
  const cached = getCached<ContentBlock | null>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('page', page)
    .eq('section', section)
    .eq('locale', locale)
    .maybeSingle();

  if (error) throw error;
  const result = (data ?? null) as ContentBlock | null;
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getReviews(filters?: { property_id?: string; agent_id?: string; published_only?: boolean; limit?: number }) {
  const cacheKey = createCacheKey(['reviews', filters]);
  const cached = getCached<Review[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.property_id) {
    query = query.eq('property_id', filters.property_id);
  }
  if (filters?.agent_id) {
    query = query.eq('agent_id', filters.agent_id);
  }
  if (filters?.published_only) {
    query = query.eq('is_published', true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []) as Review[];
  setCached(cacheKey, result, 60 * 1000);
  return result;
}

export async function getWishlist(userId: string) {
  const cacheKey = createCacheKey(['wishlist', userId]);
  const cached = getCached<Wishlist[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  const result = (data ?? []) as Wishlist[];
  setCached(cacheKey, result, 30 * 1000);
  return result;
}

export async function toggleWishlist(userId: string, propertyId: string) {
  const existing = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (existing.data) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', existing.data.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, property_id: propertyId });

  if (error) throw error;
  return true;
}

export async function incrementPropertyViews(propertyId: string) {
  const { error } = await supabase.rpc('increment_property_views', { p_property_id: propertyId });
  if (error) throw error;
}

export async function createSyncLog(log: Omit<SyncLog, 'id' | 'started_at'>) {
  const { data, error } = await supabase
    .from('sync_logs')
    .insert({ ...log, started_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data as SyncLog;
}

export async function getChatSessions(filters?: { user_id?: string; lead_id?: string; limit?: number }) {
  const cacheKey = createCacheKey(['chat_sessions', filters]);
  const cached = getCached<ChatSession[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('chat_sessions')
    .select('*')
    .order('started_at', { ascending: false });

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters?.lead_id) {
    query = query.eq('lead_id', filters.lead_id);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []) as ChatSession[];
  setCached(cacheKey, result, 30 * 1000);
  return result;
}

export async function getChatMessages(sessionId: string) {
  const cacheKey = createCacheKey(['chat_messages', sessionId]);
  const cached = getCached<ChatMessage[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  const result = (data ?? []) as ChatMessage[];
  setCached(cacheKey, result, 30 * 1000);
  return result;
}
