import { createClient } from '@supabase/supabase-js';
import { normalizePropertyPrice } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Property = {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number | null;
  currency: string;
  price_type: 'sale' | 'rent';
  property_type: 'apartment' | 'villa' | 'townhouse' | 'penthouse' | 'land' | 'commercial';
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  location: string;
  area: string;
  developer: string;
  completion_date: string | null;
  status: 'off_plan' | 'ready' | 'under_construction';
  images: string[];
  featured_image: string | null;
  gallery_images: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  floor_plans: string[];
  amenities: string[];
  features: string[];
  nearby_places: string[];
  coordinates: { lat: number; lng: number } | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_embed: string | null;
  payment_plan: PaymentPlan | null;
  is_featured: boolean;
  is_promoted: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
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
  featured_image: string;
  author_id: string;
  category: string;
  tags: string[];
  published_at: string | null;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id: string | null;
  source: string;
  language: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assigned_agent_id: string | null;
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

function normalizeProperty(p: any): Property {
  if (!p) return p;
  const lat = p.latitude ?? null;
  const lng = p.longitude ?? null;
  const country = (p.country || '').toLowerCase();
  const city = (p.city || '').toLowerCase();
  const isUAE = country === 'uae' || city === 'dubai' || city === 'abu dhabi';
  const currency = isUAE ? 'AED' : (p.currency ?? p.price_currency ?? 'USD');
  const rawPrice = p.price ?? p.price_min ?? null;
  const normalizedPrice = normalizePropertyPrice(rawPrice, currency);

  const normalizeArray = (items: any[]): string[] => {
    if (!Array.isArray(items)) return [];
    return items.map(normalizeImageUrl).filter((url): url is string => url !== null);
  };

  return {
    ...p,
    id: p.id ?? '',
    price: normalizedPrice,
    currency,
    price_type: p.price_type ?? p.listing_type ?? 'sale',
    area: p.area ?? p.area_name ?? '',
    developer: p.developer ?? p.project_name ?? '',
    featured_image: normalizeImageUrl(p.featured_image ?? p.hero_image_url ?? null),
    completion_date: p.completion_date ?? (p.year_completion ? String(p.year_completion) : null),
    gallery_images: normalizeArray(p.gallery_images),
    floor_plans: p.floor_plans ?? [],
    features: p.features ?? [],
    amenities: p.amenities ?? [],
    nearby_places: p.nearby_places ?? [],
    payment_plan: p.payment_plan ?? null,
    images: normalizeArray(p.images ?? p.gallery_images),
    google_maps_embed: p.google_maps_embed ?? p.google_maps_embed_url ?? null,
    coordinates: lat != null && lng != null ? { lat, lng } : null,
    location: p.location ?? ([p.address, p.community, p.city, p.country].filter(Boolean).join(', ') || ''),
  };
}

export async function getPropertyBySlug(slug: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return normalizeProperty(data) as Property;
}

export async function getProperties(filters?: {
  property_type?: string;
  listing_type?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  status?: string;
  limit?: number;
  offset?: number;
  featured_only?: boolean;
}) {
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.property_type) {
    query = query.eq('property_type', filters.property_type);
  }
  if (filters?.listing_type) {
    query = query.or(`price_type.eq.${filters.listing_type},listing_type.eq.${filters.listing_type}`);
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters?.min_price) {
    query = query.gte('price', filters.min_price);
  }
  if (filters?.max_price) {
    query = query.lte('price', filters.max_price);
  }
  if (filters?.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
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
  return { properties: (data ?? []).map(normalizeProperty) as Property[], totalCount: count ?? 0 };
}

export async function getAgents(filters?: {
  team_leads_only?: boolean;
  limit?: number;
}) {
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
  return (data ?? []).map(normalizeAgent) as Agent[];
}

export async function getAgentBySlug(slug: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return normalizeAgent(data) as Agent;
}

export async function getBlogPosts(filters?: {
  category?: string;
  published_only?: boolean;
  limit?: number;
  offset?: number;
}) {
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
  return data as BlogPost[];
}

export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function getSiteConfig() {
  const { data, error } = await supabase
    .from('site_config')
    .select('*')
    .single();

  if (error) throw error;
  return data as SiteConfig;
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
