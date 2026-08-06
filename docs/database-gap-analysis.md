# EVA DXB — Database Schema & Sync Gap Analysis
**Date:** 2026-08-06  
**Scope:** Current Supabase schema, TypeScript data layer, scraping/sync workflows, and page requirements.

---

## 1. Executive Summary

The current schema and TypeScript layer are **partially aligned** but contain **critical mismatches** that will cause runtime errors, failed imports, and missing features. There are also **entire feature domains** (chatbot, wishlist, partners, rewards, CMS, reviews, notifications, property comparisons, events, media tracking, sync logs) with **no database representation at all**.

### Severity Legend
- **P0** — Build breaks or data loss without it.
- **P1** — Major feature gap; required for MVP.
- **P2** — Important for operations or Phase 2.
- **P3** — Nice-to-have; can be deferred.

---

## 2. Current Schema Inventory

### Tables That Exist
| Table | Purpose | Status |
|-------|---------|--------|
| `properties` | Listings | Core fields present, but enum mismatches and missing columns |
| `agents` | Team agents | Mostly aligned |
| `blog_posts` | Blog | Aligned |
| `leads` | Contact form leads | Aligned |
| `site_config` | Key/value site settings | Aligned |
| `analytics_events` | Event tracking | Aligned |
| `embeddings` | RAG vector store | Aligned |
| `profiles` | Auth user profiles | Aligned |
| `external_webhooks` | **Referenced in code but DOES NOT EXIST** | **MISSING** |

### Tables That Are Referenced But Missing
| Missing Table | Referenced In | Severity |
|---------------|---------------|----------|
| `external_webhooks` | `supabase/functions/goyzer-webhook/index.ts`, `woocommerce-webhook/index.ts` | P0 |
| `developers` | `properties.developer_id` FK in schema | P1 |
| `projects` | `properties.project_id` FK in schema | P1 |
| `districts` / `areas` | Location filtering UX, SEO pages | P1 |
| `chat_sessions` | AI chatbot feature spec | P1 |
| `chat_messages` | AI chatbot feature spec | P1 |
| `wishlists` | `SiteConfig.wishlist_enabled`, PropertyDetail wishlist button | P1 |
| `reviews` | Social proof requirements | P2 |
| `partners` | `app/[locale]/partners/page.tsx` | P1 |
| `rewards` | `app/[locale]/rewards/page.tsx` | P1 |
| `content_blocks` | Admin live-editing requirement | P1 |
| `media_assets` | Image upload scripts, Supabase Storage metadata | P2 |
| `property_views` | `Property.views_count` field exists in TS but not DB | P2 |
| `sync_logs` | Scrape/import workflow tracking | P2 |
| `notifications` | Admin alerts, lead follow-ups | P2 |
| `comparisons` | "Compare Properties" feature spec | P3 |
| `events` / `open_houses` | Virtual open houses feature spec | P3 |
| `testimonials` | Social proof, CEO/team pages | P2 |

---

## 3. Column-Level Gaps in Existing Tables

### 3.1 `properties` Table

| Column | DB Status | TS Expectation | Gap |
|--------|-----------|----------------|-----|
| `title` | ? Exists | ? Used | — |
| `slug` | ? Exists | ? Used | — |
| `description` | ? Exists | ? Used | — |
| `short_description` | ? Exists | ? Used | — |
| `price_min` / `price_max` | ? Exists | Mapped to single `price` via `normalizePropertyPrice` | ?? Drift; works but confusing |
| `price_currency` | ? Exists | Mapped to `currency` | ?? Name mismatch |
| `property_type` | ? Exists | ? Used | — |
| `listing_type` | ? Exists (`sale`/`rent`/`both`) | ? Used | — |
| `status` | ? Exists (`active`/`pending`/`sold`/`rented`/`off_market`/`draft`) | **TS expects `off_plan` / `ready` / `under_construction`** | **P0 — MISMATCH** |
| `bedrooms` | ? `NUMERIC(3,1)` | `number | null` | ?? Precision mismatch |
| `bathrooms` | ? `NUMERIC(3,1)` | `number | null` | ?? Precision mismatch |
| `area_sqft` | ? Exists | ? Used | — |
| `address` | ? Exists | Used in `location` composite | — |
| `area_name` | ? Exists | Mapped to `area` | ?? Name mismatch |
| `community` | ? Exists | Used in `location` composite | — |
| `city` | ? Exists | Used in `location` composite | — |
| `country` | ? Exists | Used in `location` composite | — |
| `latitude` / `longitude` | ? Exists | Mapped to `coordinates` | — |
| `google_maps_embed_url` | ? Exists | Mapped to `google_maps_embed` | ?? Name mismatch |
| `developer_id` | ? Exists (UUID FK) | **TS expects `developer` as text** | **P0 — MISMATCH** |
| `project_name` | ? Exists | Mapped to `developer` fallback | ?? Semantic misuse |
| `project_id` | ? Exists (UUID FK) | Not used in TS | ?? Orphaned FK |
| `features` | ? JSONB | ? Used | — |
| `amenities` | ? JSONB | ? Used | — |
| `nearby_places` | ? JSONB | ? Used | — |
| `hero_image_url` | ? Exists | Mapped to `featured_image` | ?? Name mismatch |
| `gallery_images` | ? JSONB | Mapped to `images` + `gallery_images` | ?? Redundant |
| `floor_plan_images` | ? Exists | Mapped to `floor_plans` | ?? Name mismatch |
| `video_url` | ? Exists | ? Used | — |
| `virtual_tour_url` | ? Exists | ? Used | — |
| `payment_plan` | ? JSONB | ? Used | — |
| `is_featured` | ? Exists | ? Used | — |
| `is_promoted` | ? Exists | ? Used | — |
| `sort_order` | ? Exists | Not used | Low |
| `published_at` | ? Exists | Not used | Low |
| `created_at` / `updated_at` | ? Exists | ? Used | — |
| `deleted_at` | ? Exists | Not used | Low |
| `meta_title` / `meta_description` / `og_image_url` | ? Exists | Not used in TS | Low |
| `floor_number` / `total_floors` / `year_built` | ? Exists | Not used | Low |
| `built_up_area_sqft` / `plot_area_sqft` | ? Exists | Not used | Low |
| `price_per_sqft` | ? Exists | Not used | Low |
| `goyzer_listing_id` | ? Exists | Not used in TS | Low |
| `woocommerce_product_id` | ? Exists | Not used | Low |
| `external_id` / `external_source` | ? Exists | Used by scrapers | — |
| **`views_count`** | ? **Missing** | **`Property.views_count: number`** | **P1** |
| **`agent_id`** | ? **Missing** | **Referenced in `goyzer-webhook` for linking** | **P1** |
| **`completion_date`** | ? **Missing as TEXT** | **TS expects `completion_date: string | null`** | **P1** |

### 3.2 `agents` Table
- Largely aligned with TS `Agent` type.
- Missing: `rera_license_expiry` is `DATE` in DB but not consistently handled.
- Missing: No `avatar_url` vs `profile_image_url` mismatch — actually aligned.

### 3.3 `blog_posts` Table
- Largely aligned.
- TS type is missing: `content_html`, `hero_image_alt`, `gallery_images`, `author_name`, `author_role`, `is_featured`, `scheduled_at`, `reading_time`, `views_count`.

### 3.4 `leads` Table
- DB has richer fields than TS type (e.g., `source_page`, `agent_id`, `utm_*`, `priority`, `notes`, `last_contacted_at`, `next_follow_up_at`).
- TS `Lead` type is **underspecified** and will drop these fields on insert/read.

### 3.5 `site_config` Table
- TS `SiteConfig` type is a **hardcoded shape**, but DB is key/value JSONB.
- The seed script and `getSiteConfig()` query assume a **single row** with `key` uniqueness, but the TS type implies a **single object** — this works if you query by key or have one row, but is fragile.

---

## 4. Data Layer / Normalization Gaps

### 4.1 `normalizeProperty()` Drift
`lib/supabase/queries.ts` does heavy normalization that **masks schema drift** rather than fixing it:
- Maps `p.area` ? `area` (DB has `area_name`)
- Maps `p.developer` / `p.project_name` ? `developer` (DB has `developer_id` UUID)
- Maps `p.hero_image_url` ? `featured_image` (DB has `hero_image_url`)
- Maps `p.floor_plans` ? `floor_plans` (DB has `floor_plan_images`)
- Maps `p.google_maps_embed` ? `google_maps_embed` (DB has `google_maps_embed_url`)
- Maps `p.listing_type` ? `price_type` (TS uses `price_type` but UI uses `listing_type`)

**Risk:** When the TS layer is bypassed (e.g., direct SQL, webhooks, admin API), the app breaks.

### 4.2 Scraper ? DB Mismatch
- `scripts/seed.ts` and `scripts/import-offplan.ts` insert:
  - `status: 'off_plan'` ? **DB CHECK constraint rejects this** (valid: `active`/`pending`/`sold`/`rented`/`off_market`/`draft`)
  - `developer: 'DAMAC Properties'` as text ? **DB expects `developer_id` UUID**
  - `area_name`, `community`, `city`, `country` as text ? ? DB has these
  - `hero_image_url`, `gallery_images` ? ? DB has these
  - `google_maps_embed_url` ? ? DB has this
  - `payment_plan` as JSONB ? ? DB has this
  - `external_source`, `external_id` ? ? DB has these

**Result:** Scraper imports will fail on `status` and `developer_id` columns.

### 4.3 Webhook ? DB Mismatch
- `goyzer-webhook` writes `developer` as text to `properties.developer` ? **Column doesn't exist** (only `developer_id`).
- `goyzer-webhook` writes `agent_id` to `properties` ? **Column doesn't exist**.
- Both webhooks write to `external_webhooks` ? **Table doesn't exist**.

### 4.4 Cache Invalidation
- `lib/cache.ts` is an in-memory Map. In a serverless Next.js environment, this cache is **per-worker and ephemeral**.
- No cache invalidation on write (no DB triggers ? cache busting).
- Risk: Stale data after admin edits or webhook updates.

---

## 5. Feature Requirements vs. Database Coverage

| Feature | Required Data | Current Coverage | Gap |
|---------|--------------|------------------|-----|
| Homepage hero + search | `properties` (featured) | ? | — |
| Listings grid + filters | `properties` with filters | ?? Partial (status enum mismatch) | P0 |
| Property detail | `properties` + `agents` | ?? Partial (developer as text, missing views_count) | P0 |
| Off-Plan page | `properties` where `status='off_plan'` | ? Fails (DB enum) | P0 |
| Secondary page | `properties` where `status='ready'` | ? Fails (DB enum) | P0 |
| Admin dashboard | Stats from all tables | ?? Mock data only | P1 |
| Admin properties CRUD | `properties` full CRUD | ?? No write queries in TS | P1 |
| Admin agents CRUD | `agents` full CRUD | ?? No write queries in TS | P1 |
| Admin blog CRUD | `blog_posts` full CRUD | ?? No write queries in TS | P1 |
| Contact form | `leads` insert | ? | — |
| AI Chatbot | `chat_sessions`, `chat_messages` | ? No tables | P1 |
| Wishlist | `wishlists` | ? No table | P1 |
| Partners page | `partners` | ? No table | P1 |
| Rewards page | `rewards` | ? No table | P1 |
| Goyzer sync | `properties` upsert + `external_webhooks` | ? Broken (developer, agent_id, webhooks table) | P0 |
| WooCommerce sync | `properties` + `leads` + `external_webhooks` | ? Broken (webhooks table) | P0 |
| Scrape import | `properties` upsert | ? Broken (status enum, developer_id) | P0 |
| Live CMS editing | `content_blocks` | ? No table | P1 |
| Reviews/testimonials | `reviews` | ? No table | P2 |
| Media manager | `media_assets` | ? No table | P2 |
| Property views tracking | `property_views` or `views_count` updates | ? `views_count` column missing | P2 |
| Notifications | `notifications` | ? No table | P2 |
| Property comparisons | `comparisons` | ? No table | P3 |
| Open houses / events | `events` | ? No table | P3 |

---

## 6. Detailed Technical Specification for Additions

### 6.1 Fixes to Existing Schema (P0)

#### A. Align `properties.status` Enum
Replace the current `status` CHECK constraint with values that match both the frontend and scrapers:

```sql
ALTER TABLE public.properties DROP CONSTRAINT properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check 
  CHECK (status IN ('off_plan', 'ready', 'under_construction', 'active', 'pending', 'sold', 'rented', 'off_market', 'draft'));
```

#### B. Add Missing Columns to `properties`
```sql
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id),
  ADD COLUMN IF NOT EXISTS completion_date TEXT;
```

#### C. Add `developers` Table and Fix `properties.developer_id`
```sql
CREATE TABLE IF NOT EXISTS public.developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_developers_slug ON public.developers(slug);
CREATE INDEX IF NOT EXISTS idx_developers_name ON public.developers(name);

-- Backfill: ensure developer_id FK is valid, or make it nullable during migration
ALTER TABLE public.properties ALTER COLUMN developer_id DROP NOT NULL;
```

**Sync workflow:** During scrape/import, if `developer` text is present, `UPSERT` into `developers` by `name`, then set `properties.developer_id`.

#### D. Add `projects` Table
```sql
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    developer_id UUID REFERENCES public.developers(id),
    description TEXT,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    start_date DATE,
    completion_date DATE,
    payment_plan JSONB,
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    hero_image_url TEXT,
    gallery_images JSONB DEFAULT '[]',
    video_url TEXT,
    virtual_tour_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_promoted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_developer_id ON public.projects(developer_id);
```

#### E. Create `external_webhooks` Table
```sql
CREATE TABLE IF NOT EXISTS public.external_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('goyzer', 'woocommerce', 'scraper')),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    property_id UUID REFERENCES public.properties(id),
    lead_id UUID REFERENCES public.leads(id),
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_webhooks_source ON public.external_webhooks(source);
CREATE INDEX IF NOT EXISTS idx_external_webhooks_processed ON public.external_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_external_webhooks_created_at ON public.external_webhooks(created_at);
```

---

### 6.2 New Feature Tables (P1)

#### A. `chat_sessions` + `chat_messages`
```sql
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT,
    language TEXT DEFAULT 'en',
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT FALSE,
    lead_id UUID REFERENCES public.leads(id),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    language TEXT,
    sentiment TEXT,
    intent TEXT,
    entities JSONB DEFAULT '[]',
    tool_calls JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_token ON public.chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_lead_id ON public.chat_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
```

#### B. `wishlists`
```sql
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_property_id ON public.wishlists(property_id);
```

#### C. `partners`
```sql
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_slug ON public.partners(slug);
CREATE INDEX IF NOT EXISTS idx_partners_category ON public.partners(category);
```

#### D. `rewards`
```sql
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    points_required INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    terms_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_slug ON public.rewards(slug);
CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON public.rewards(is_active);
```

#### E. `content_blocks` (CMS)
```sql
CREATE TABLE IF NOT EXISTS public.content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,
    section TEXT NOT NULL,
    locale TEXT DEFAULT 'en',
    content JSONB NOT NULL DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page, section, locale)
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_page ON public.content_blocks(page);
CREATE INDEX IF NOT EXISTS idx_content_blocks_locale ON public.content_blocks(locale);
```

---

### 6.3 Operational Tables (P2)

#### A. `reviews`
```sql
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON public.reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON public.reviews(is_published);
```

#### B. `media_assets`
```sql
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_bucket_path ON public.media_assets(bucket, path);
```

#### C. `property_views`
```sql
CREATE TABLE IF NOT EXISTS public.property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    viewer_ip INET,
    session_id TEXT,
    user_id TEXT,
    referrer TEXT,
    page_url TEXT,
    device_type TEXT,
    country_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created_at ON public.property_views(created_at);
```

#### D. `sync_logs`
```sql
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('scraper', 'goyzer', 'woocommerce', 'manual')),
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_source ON public.sync_logs(source);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.sync_logs(started_at);
```

#### E. `notifications`
```sql
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
```

---

### 6.4 Nice-to-Have Tables (P3)

#### A. `comparisons`
```sql
CREATE TABLE IF NOT EXISTS public.comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    property_ids UUID[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### B. `events` (Open Houses / Virtual Tours)
```sql
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
```

---

## 7. Required TypeScript Type Updates

### 7.1 `lib/supabase/queries.ts` — `Property` Type
Replace the drifted `Property` type with one that matches the DB schema directly. Remove `normalizeProperty()` field-renaming logic and use the real column names:

```typescript
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
  developer?: string; // denormalized for display
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
};
```

### 7.2 `lib/supabase/queries.ts` — `Lead` Type
Expand to match DB:

```typescript
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
```

### 7.3 Add New Query Functions
Add typed queries for all new tables: `getDevelopers()`, `getProjects()`, `getPartners()`, `getRewards()`, `getContentBlocks()`, `getReviews()`, `getChatSessions()`, `getWishlist()`, `toggleWishlist()`, `incrementPropertyViews()`, `createSyncLog()`, etc.

---

## 8. Synchronization Workflows

### 8.1 Scraper Import Workflow (Fix Existing)
**Current:** `scripts/import-offplan.ts` inserts directly and fails on enum/developer_id.  
**Required:**
1. **Pre-validate** each record against DB schema before insert.
2. **Map `status`**: scraped `'off_plan'` ? DB `'active'` (or add `'off_plan'` to enum).
3. **Resolve `developer`**: `UPSERT` into `developers` by `name` ? get `id` ? set `properties.developer_id`.
4. **Resolve `project`**: `UPSERT` into `projects` by `slug` ? get `id` ? set `properties.project_id`.
5. **Log each batch** into `sync_logs`.
6. **Invalidate cache** after batch complete.

### 8.2 Goyzer Webhook Workflow (Fix Existing)
**Current:** Writes `developer` text and `agent_id` to columns that don't exist; writes to missing `external_webhooks`.  
**Required:**
1. Resolve `payload.developer` ? `developers.id` via `UPSERT`.
2. Resolve `payload.agent_email` ? `agents.id` ? set `properties.agent_id`.
3. Write webhook log to `external_webhooks` table.
4. Return property `id` in response for downstream linking.

### 8.3 WooCommerce Webhook Workflow (Fix Existing)
**Current:** Writes to `external_webhooks` (missing table).  
**Required:**
1. Create `external_webhooks` table.
2. Ensure `leads` upsert uses correct conflict target.

### 8.4 Scrape-to-Image Pipeline
**Current:** `scripts/seed.ts` and `import-offplan.ts` keep old WordPress URLs (`https://evadxb.com/wp-content/uploads/...`).  
**Required:**
1. Download images during scrape to `./data/images/`.
2. Upload to Supabase Storage bucket `property-images` via `scripts/upload-property-images.ts`.
3. Replace URLs in DB with Supabase Storage public URLs.
4. Track uploads in `media_assets` table.

### 8.5 Cache Invalidation Strategy
- On **write** (admin edit, webhook, import): call `invalidateCache('properties')` or similar.
- In **serverless**, consider **Redis** or **Supabase Realtime** for cross-worker cache busting instead of in-memory Map.
- Alternatively: use **Next.js `revalidatePath()`** / `revalidateTag()` in Server Actions.

### 8.6 Admin Write Paths
Currently admin pages are **UI-only** (mock data, no mutations). Required:
- Server Actions or API routes for CRUD on `properties`, `agents`, `blog_posts`, `content_blocks`.
- Row-level security already allows admin role; need auth enforcement in API layer.
- Image upload via Supabase Storage with `media_assets` tracking.

---

## 9. Migration Execution Plan

### Phase 1 — Fix Build Breakers (P0)
1. Apply enum fix for `properties.status`.
2. Add `views_count`, `agent_id`, `completion_date` to `properties`.
3. Create `external_webhooks` table.
4. Update `goyzer-webhook` and `woocommerce-webhook` to use real columns.
5. Update TypeScript `Property` and `Lead` types to match DB.
6. Remove `normalizeProperty()` field-renaming; use DB names directly.
7. Fix scraper imports to resolve `developer_id` and `project_id`.

### Phase 2 — Core Feature Tables (P1)
8. Create `developers`, `projects`, `districts`, `partners`, `rewards`, `content_blocks`, `chat_sessions`, `chat_messages`, `wishlists`.
9. Add query functions for new tables.
10. Wire up admin CRUD pages to real mutations.
11. Implement image upload pipeline to Supabase Storage.

### Phase 3 — Operational Tables (P2)
12. Create `reviews`, `media_assets`, `property_views`, `sync_logs`, `notifications`.
13. Add `incrementPropertyViews()` trigger or function.
14. Replace in-memory cache with Redis or Realtime-backed cache.

### Phase 4 — Nice-to-Have (P3)
15. Create `comparisons`, `events`, `testimonials`.
16. Add AI chatbot admin dashboard for chat logs.
17. Implement property comparison UI.

---

## 10. Open Questions / Decisions Needed

1. **Status enum:** Do you want to keep the DB-wide `active`/`sold`/etc. and add `off_plan`/`ready`/`under_construction` as aliases, or replace entirely?  
2. **Cache strategy:** In-memory per-worker vs. Redis vs. Realtime?  
3. **Scrape image hosting:** Upload all to Supabase Storage now, or keep original URLs until Supabase migration is complete?  
4. **Districts table:** Flat list vs. hierarchical (city ? district ? community)?  
5. **Chatbot storage:** Store full message JSONB or normalized rows? (Normalized recommended for analytics.)

---

## 11. Files to Modify / Create

| Action | Path |
|--------|------|
| Modify | `supabase/migrations/20240101000000_initial_schema.sql` (or new migration) |
| Create | `supabase/migrations/20240101000002_fix_properties_and_webhooks.sql` |
| Create | `supabase/migrations/20240101000003_feature_tables.sql` |
| Modify | `lib/supabase/queries.ts` |
| Modify | `scripts/import-offplan.ts` |
| Modify | `scripts/seed.ts` |
| Modify | `supabase/functions/goyzer-webhook/index.ts` |
| Modify | `supabase/functions/woocommerce-webhook/index.ts` |
| Create | `lib/supabase/developers.ts` |
| Create | `lib/supabase/projects.ts` |
| Create | `lib/supabase/chat.ts` |
| Create | `lib/supabase/wishlists.ts` |
| Create | `scripts/migrate-images-to-storage.ts` |
| Create | `scripts/backfill-developers.ts` |
