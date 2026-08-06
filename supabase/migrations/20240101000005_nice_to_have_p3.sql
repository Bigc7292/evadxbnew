-- ============================================================================
-- P3 Nice-to-Have Tables: comparisons, events, testimonials
-- ============================================================================

-- Property comparisons
CREATE TABLE IF NOT EXISTS public.comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    property_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events / Open Houses
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('open_house', 'webinar', 'virtual_tour', 'exhibition')),
    property_id UUID REFERENCES public.properties(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    location TEXT,
    meeting_url TEXT,
    max_attendees INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_property_id ON public.events(property_id);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    user_title TEXT,
    user_image_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_property_id ON public.testimonials(property_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_agent_id ON public.testimonials(agent_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_published ON public.testimonials(is_published);
