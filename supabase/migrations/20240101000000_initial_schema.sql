-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Properties table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'commercial', 'land')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented', 'off_market', 'draft')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'both')),
    
    -- Pricing
    price_min NUMERIC(15, 2),
    price_max NUMERIC(15, 2),
    price_currency TEXT DEFAULT 'AED',
    price_per_sqft NUMERIC(10, 2),
    payment_plan JSONB,
    
    -- Property details
    bedrooms NUMERIC(3, 1),
    bathrooms NUMERIC(3, 1),
    area_sqft NUMERIC(10, 2),
    built_up_area_sqft NUMERIC(10, 2),
    plot_area_sqft NUMERIC(10, 2),
    floor_number INTEGER,
    total_floors INTEGER,
    year_built INTEGER,
    year_completion INTEGER,
    
    -- Location
    address TEXT,
    area_name TEXT,
    community TEXT,
    city TEXT DEFAULT 'Dubai',
    country TEXT DEFAULT 'UAE',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    google_maps_embed_url TEXT,
    google_maps_place_id TEXT,
    
    -- Developer & Project
    developer_id UUID,
    project_name TEXT,
    project_id UUID,
    
    -- Features
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    nearby_places JSONB DEFAULT '[]',
    
    -- Media
    hero_image_url TEXT,
    hero_image_alt TEXT,
    gallery_images JSONB DEFAULT '[]',
    floor_plan_images JSONB DEFAULT '[]',
    video_url TEXT,
    virtual_tour_url TEXT,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    
    -- External integrations
    goyzer_listing_id TEXT,
    woocommerce_product_id TEXT,
    external_id TEXT,
    external_source TEXT,
    
    -- Admin
    is_featured BOOLEAN DEFAULT FALSE,
    is_promoted BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Agents table
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    whatsapp TEXT,
    position TEXT,
    bio TEXT,
    short_bio TEXT,
    languages TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    areas_covered TEXT[] DEFAULT '{}',
    profile_image_url TEXT,
    profile_image_alt TEXT,
    social_links JSONB DEFAULT '{}',
    is_leader BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    rera_license_number TEXT,
    rera_license_expiry DATE,
    years_experience INTEGER,
    total_sales_volume NUMERIC(15, 2),
    properties_sold INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Blog posts table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    content_html TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    hero_image_url TEXT,
    hero_image_alt TEXT,
    gallery_images JSONB DEFAULT '[]',
    author_id UUID REFERENCES public.agents(id),
    author_name TEXT,
    author_role TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    reading_time INTEGER,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    message TEXT,
    source TEXT,
    source_page TEXT,
    property_id UUID REFERENCES public.properties(id),
    project_id UUID,
    agent_id UUID REFERENCES public.agents(id),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    google_id TEXT,
    yandex_id TEXT,
    fb_pixel_id TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'viewing', 'offer', 'closed_won', 'closed_lost', 'spam')),
    priority INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES public.agents(id),
    notes TEXT,
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site configuration table
CREATE TABLE public.site_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    event_properties JSONB DEFAULT '{}',
    user_id TEXT,
    session_id TEXT,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country_code TEXT,
    language_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VECTOR EMBEDDINGS FOR RAG
-- ============================================================================

CREATE TABLE public.embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding VECTOR(1536),
    source_type TEXT,
    source_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Properties indexes
CREATE INDEX idx_properties_slug ON public.properties(slug);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_area_name ON public.properties(area_name);
CREATE INDEX idx_properties_community ON public.properties(community);
CREATE INDEX idx_properties_price_min ON public.properties(price_min);
CREATE INDEX idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX idx_properties_is_featured ON public.properties(is_featured);
CREATE INDEX idx_properties_is_promoted ON public.properties(is_promoted);
CREATE INDEX idx_properties_developer_id ON public.properties(developer_id);
CREATE INDEX idx_properties_goyzer_listing_id ON public.properties(goyzer_listing_id);
CREATE INDEX idx_properties_woocommerce_product_id ON public.properties(woocommerce_product_id);
CREATE INDEX idx_properties_published_at ON public.properties(published_at);
CREATE INDEX idx_properties_created_at ON public.properties(created_at);
CREATE INDEX idx_properties_location ON public.properties USING GIST (
    ll_to_earth(latitude, longitude)
);

-- Agents indexes
CREATE INDEX idx_agents_slug ON public.agents(slug);
CREATE INDEX idx_agents_is_active ON public.agents(is_active);
CREATE INDEX idx_agents_is_leader ON public.agents(is_leader);
CREATE INDEX idx_agents_email ON public.agents(email);

-- Blog posts indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_is_published ON public.blog_posts(is_published);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);

-- Leads indexes
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_phone ON public.leads(phone);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_property_id ON public.leads(property_id);
CREATE INDEX idx_leads_agent_id ON public.leads(agent_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_source ON public.leads(source);

-- Embeddings index for vector search
CREATE INDEX idx_embeddings_embedding ON public.embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- Properties: public read, admin write
CREATE POLICY "Public read access for published properties" ON public.properties
    FOR SELECT USING (
        status = 'active' 
        AND (published_at IS NULL OR published_at <= NOW())
        AND deleted_at IS NULL
    );

CREATE POLICY "Admin full access to properties" ON public.properties
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Agents: public read active, admin write
CREATE POLICY "Public read access for active agents" ON public.agents
    FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL);

CREATE POLICY "Admin full access to agents" ON public.agents
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Blog posts: public read published, admin write
CREATE POLICY "Public read access for published blog posts" ON public.blog_posts
    FOR SELECT USING (
        is_published = TRUE 
        AND (published_at IS NULL OR published_at <= NOW())
        AND deleted_at IS NULL
    );

CREATE POLICY "Admin full access to blog posts" ON public.blog_posts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Leads: public insert, admin read/write
CREATE POLICY "Public can insert leads" ON public.leads
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admin full access to leads" ON public.leads
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Site config: public read public keys, admin write
CREATE POLICY "Public read access for public site config" ON public.site_config
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Admin full access to site config" ON public.site_config
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Analytics: service role only
CREATE POLICY "Service role can insert analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin read analytics" ON public.analytics_events
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Embeddings: service role only
CREATE POLICY "Service role full access to embeddings" ON public.embeddings
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
    counter INTEGER := 0;
    base_slug TEXT;
BEGIN
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(base_slug, '-');
    slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.properties WHERE slug = public.properties.slug) 
       OR EXISTS (SELECT 1 FROM public.agents WHERE slug = public.agents.slug)
       OR EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = public.blog_posts.slug) LOOP
        counter := counter + 1;
        slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Function to search properties with filters
CREATE OR REPLACE FUNCTION public.search_properties(
    p_listing_type TEXT DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'active',
    p_area_name TEXT DEFAULT NULL,
    p_community TEXT DEFAULT NULL,
    p_bedrooms_min NUMERIC DEFAULT NULL,
    p_bedrooms_max NUMERIC DEFAULT NULL,
    p_bathrooms_min NUMERIC DEFAULT NULL,
    p_bathrooms_max NUMERIC DEFAULT NULL,
    p_price_min NUMERIC DEFAULT NULL,
    p_price_max NUMERIC DEFAULT NULL,
    p_area_sqft_min NUMERIC DEFAULT NULL,
    p_area_sqft_max NUMERIC DEFAULT NULL,
    p_is_featured BOOLEAN DEFAULT NULL,
    p_is_promoted BOOLEAN DEFAULT NULL,
    p_developer_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    title TEXT,
    short_description TEXT,
    property_type TEXT,
    status TEXT,
    listing_type TEXT,
    price_min NUMERIC,
    price_max NUMERIC,
    price_currency TEXT,
    bedrooms NUMERIC,
    bathrooms NUMERIC,
    area_sqft NUMERIC,
    area_name TEXT,
    community TEXT,
    hero_image_url TEXT,
    is_featured BOOLEAN,
    is_promoted BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.slug,
        pr.title,
        pr.short_description,
        pr.property_type,
        pr.status,
        pr.listing_type,
        pr.price_min,
        pr.price_max,
        pr.price_currency,
        pr.bedrooms,
        pr.bathrooms,
        pr.area_sqft,
        pr.area_name,
        pr.community,
        pr.hero_image_url,
        pr.is_featured,
        pr.is_promoted,
        pr.created_at
    FROM public.properties pr
    WHERE pr.deleted_at IS NULL
    AND (p_status IS NULL OR pr.status = p_status)
    AND (p_listing_type IS NULL OR pr.listing_type = p_listing_type)
    AND (p_property_type IS NULL OR pr.property_type = p_property_type)
    AND (p_area_name IS NULL OR pr.area_name ILIKE '%' || p_area_name || '%')
    AND (p_community IS NULL OR pr.community ILIKE '%' || p_community || '%')
    AND (p_bedrooms_min IS NULL OR pr.bedrooms >= p_bedrooms_min)
    AND (p_bedrooms_max IS NULL OR pr.bedrooms <= p_bedrooms_max)
    AND (p_bathrooms_min IS NULL OR pr.bathrooms >= p_bathrooms_min)
    AND (p_bathrooms_max IS NULL OR pr.bathrooms <= p_bathrooms_max)
    AND (p_price_min IS NULL OR pr.price_max >= p_price_min)
    AND (p_price_max IS NULL OR pr.price_min <= p_price_max)
    AND (p_area_sqft_min IS NULL OR pr.area_sqft >= p_area_sqft_min)
    AND (p_area_sqft_max IS NULL OR pr.area_sqft <= p_area_sqft_max)
    AND (p_is_featured IS NULL OR pr.is_featured = p_is_featured)
    AND (p_is_promoted IS NULL OR pr.is_promoted = p_is_promoted)
    AND (p_developer_id IS NULL OR pr.developer_id = p_developer_id)
    AND (pr.published_at IS NULL OR pr.published_at <= NOW())
    ORDER BY 
        CASE WHEN p_sort_by = 'price_min' AND p_sort_order = 'ASC' THEN pr.price_min END ASC,
        CASE WHEN p_sort_by = 'price_min' AND p_sort_order = 'DESC' THEN pr.price_min END DESC,
        CASE WHEN p_sort_by = 'price_max' AND p_sort_order = 'ASC' THEN pr.price_max END ASC,
        CASE WHEN p_sort_by = 'price_max' AND p_sort_order = 'DESC' THEN pr.price_max END DESC,
        CASE WHEN p_sort_by = 'bedrooms' AND p_sort_order = 'ASC' THEN pr.bedrooms END ASC,
        CASE WHEN p_sort_by = 'bedrooms' AND p_sort_order = 'DESC' THEN pr.bedrooms END DESC,
        CASE WHEN p_sort_by = 'area_sqft' AND p_sort_order = 'ASC' THEN pr.area_sqft END ASC,
        CASE WHEN p_sort_by = 'area_sqft' AND p_sort_order = 'DESC' THEN pr.area_sqft END DESC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN pr.created_at END ASC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN pr.created_at END DESC,
        pr.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count search results
CREATE OR REPLACE FUNCTION public.count_properties(
    p_listing_type TEXT DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'active',
    p_area_name TEXT DEFAULT NULL,
    p_community TEXT DEFAULT NULL,
    p_bedrooms_min NUMERIC DEFAULT NULL,
    p_bedrooms_max NUMERIC DEFAULT NULL,
    p_bathrooms_min NUMERIC DEFAULT NULL,
    p_bathrooms_max NUMERIC DEFAULT NULL,
    p_price_min NUMERIC DEFAULT NULL,
    p_price_max NUMERIC DEFAULT NULL,
    p_area_sqft_min NUMERIC DEFAULT NULL,
    p_area_sqft_max NUMERIC DEFAULT NULL,
    p_is_featured BOOLEAN DEFAULT NULL,
    p_is_promoted BOOLEAN DEFAULT NULL,
    p_developer_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count
    FROM public.properties pr
    WHERE pr.deleted_at IS NULL
    AND (p_status IS NULL OR pr.status = p_status)
    AND (p_listing_type IS NULL OR pr.listing_type = p_listing_type)
    AND (p_property_type IS NULL OR pr.property_type = p_property_type)
    AND (p_area_name IS NULL OR pr.area_name ILIKE '%' || p_area_name || '%')
    AND (p_community IS NULL OR pr.community ILIKE '%' || p_community || '%')
    AND (p_bedrooms_min IS NULL OR pr.bedrooms >= p_bedrooms_min)
    AND (p_bedrooms_max IS NULL OR pr.bedrooms <= p_bedrooms_max)
    AND (p_bathrooms_min IS NULL OR pr.bathrooms >= p_bathrooms_min)
    AND (p_bathrooms_max IS NULL OR pr.bathrooms <= p_bathrooms_max)
    AND (p_price_min IS NULL OR pr.price_max >= p_price_min)
    AND (p_price_max IS NULL OR pr.price_min <= p_price_max)
    AND (p_area_sqft_min IS NULL OR pr.area_sqft >= p_area_sqft_min)
    AND (p_area_sqft_max IS NULL OR pr.area_sqft <= p_area_sqft_max)
    AND (p_is_featured IS NULL OR pr.is_featured = p_is_featured)
    AND (p_is_promoted IS NULL OR pr.is_promoted = p_is_promoted)
    AND (p_developer_id IS NULL OR pr.developer_id = p_developer_id)
    AND (pr.published_at IS NULL OR pr.published_at <= NOW());
    
    RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;