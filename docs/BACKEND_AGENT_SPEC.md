# Backend Agent: Secondary Market Property Synchronization
## Technical Specification & Implementation Roadmap

## 1. Executive Summary

This document specifies the architecture for a backend agent that automates the synchronization of secondary market property data from the existing EVA DXB website (evadxb.com) into the Supabase backend. The system includes a robust scraping pipeline, idempotent database synchronization, and a secure admin authentication layer to manage operations.

---

## 2. System Architecture

### 2.1 High-Level Components

`	ext
+-------------------+     +-------------------+     +-------------------+
|   EVA DXB Website | --> |   Scraping Agent  | --> |  Sync Orchestrator |
+-------------------+     +-------------------+     +-------------------+
                                                          |
                                                          v
                                                +-------------------+
                                                |  Supabase Backend  |
                                                |  (PostgreSQL + RLS)|
                                                +-------------------+
                                                          |
                                                          v
                                                +-------------------+
                                                |   Admin Dashboard  |
                                                |  (Next.js + Auth)  |
                                                +-------------------+
`

### 2.2 Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Scraping | Firecrawl SDK + custom parsers | Handles JS-rendered pages, returns clean markdown/JSON |
| Agent Runtime | Node.js 20 + TypeScript | Matches existing project runtime |
| Scheduling | Supabase Edge Functions (cron) or GitHub Actions | Free tier, reliable, no server cost |
| Database | Supabase PostgreSQL | Already integrated; RLS for security |
| Auth | Supabase Auth + custom JWT claims | Secure, scalable, supports MFA |
| Queue | Supabase Realtime or lightweight PostgreSQL queue | Zero additional infra |
| Monitoring | Supabase Logs + custom audit table | Full observability |

---

## 3. Scraping Strategy

### 3.1 Target Data Sources

| Source | URL Pattern | Data Richness |
|--------|------------|---------------|
| Off-Plan listings | https://evadxb.com/off-plan-properties/ | High (payment plans, floor plans, gallery) |
| Secondary listings | https://evadxb.com/properties/ or category pages | Medium-High |
| Project detail pages | https://evadxb.com/{project-slug}/ | High (amenities, location, pricing) |

### 3.2 Scraping Pipeline

#### Phase 1: Discovery
1. **Crawl listing index pages** using Firecrawl map endpoint to discover all property URLs
2. **Store discovered URLs** in a scrape_queue table with status pending
3. **Deduplicate** by URL hash to avoid re-scraping unchanged pages

#### Phase 2: Extraction
For each property URL:
1. **Fetch page** via Firecrawl scrape endpoint with ormats: ['markdown', 'json']
2. **Parse structured data** using regex + DOM heuristics:
   - Title, price, bedrooms, bathrooms, area
   - Amenities, features, nearby places
   - Payment plan tables
   - Image URLs (hero + gallery)
   - Google Maps embed / coordinates
   - Developer name
3. **Enrich with external APIs** (optional, zero-cost where possible):
   - Geocode missing coordinates using Nominatim (OpenStreetMap)
   - Validate developer names against known list
4. **Normalize** into internal schema matching properties table

#### Phase 3: Validation
1. **Schema validation** using Zod
2. **Business rules**:
   - Price must be > 0 or null
   - Bedrooms/bathrooms must be positive integers or null
   - Slug must be unique and URL-safe
   - Images must be reachable (HEAD request)
3. **Quality scoring**: completeness % (required fields present)

### 3.3 Scraping Agent Code Structure

`
scripts/
  scrape-agent/
    src/
      index.ts              # Entry point
      crawler.ts            # Firecrawl integration
      parser.ts             # Markdown -> structured data
      enricher.ts           # External API enrichment
      validator.ts          # Zod schemas + business rules
      storage.ts            # Supabase read/write
      queue.ts              # Job queue management
      types.ts              # TypeScript interfaces
    tests/
      parser.test.ts
      validator.test.ts
`

### 3.4 Rate Limiting & Politeness

| Setting | Value | Reason |
|---------|-------|--------|
| Request delay | 2-5 seconds between pages | Avoid overwhelming source |
| Retry attempts | 3 with exponential backoff | Handle transient failures |
| Concurrency | 1-2 parallel requests | Respect source server |
| User-Agent | Custom: EVA-Sync-Agent/1.0 | Transparency |
| robots.txt | Honor strictly | Ethical scraping |

---

## 4. Database Synchronization Mechanism

### 4.1 Core Principles

- **Idempotent**: Running the sync twice produces the same result
- **Upsert-based**: Use slug or external_id as the natural key
- **Soft deletes**: Never hard-delete; mark deleted_at for removed listings
- **Audit trail**: Every change logged in sync_log table

### 4.2 Sync Workflow

`	ext
For each scraped property:
  1. Check if property exists by slug or external_id
  2. If exists:
     a. Compare hash of critical fields (title, price, status)
     b. If changed -> UPDATE + INSERT into sync_log
     c. If unchanged -> SKIP
  3. If not exists:
     a. INSERT new property
     b. INSERT into sync_log as 'created'
  4. Handle images:
     a. Download to Supabase Storage (if new/changed)
     b. Update hero_image_url, gallery_images
  5. Post-sync:
     a. Regenerate Next.js static params if needed
     b. Invalidate CDN cache for affected pages
`

### 4.3 Sync State Tracking

Add a sync_meta JSONB column to properties:

`sql
ALTER TABLE public.properties 
  ADD COLUMN sync_meta JSONB DEFAULT '{}'::jsonb;

CREATE INDEX idx_properties_sync_meta ON public.properties USING GIN (sync_meta);
`

sync_meta structure:
`json
{
  "last_scraped_at": "2026-07-29T10:00:00Z",
  "source_url": "https://evadxb.com/project-slug/",
  "external_id": "12345",
  "external_source": "evadxb",
  "scrape_hash": "abc123def456",
  "quality_score": 0.85,
  "sync_status": "synced",
  "sync_errors": []
}
`

### 4.4 Sync Log Table

`sql
CREATE TABLE public.sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('property', 'agent', 'blog_post')),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'skipped', 'failed')),
    changes JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    scrape_hash TEXT,
    quality_score NUMERIC(3, 2),
    initiated_by TEXT DEFAULT 'agent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_log_entity ON public.sync_log(entity_type, entity_id);
CREATE INDEX idx_sync_log_created_at ON public.sync_log(created_at DESC);
`

### 4.5 Reconciliation Strategy

| Scenario | Action |
|----------|--------|
| New listing on source | INSERT into properties, status = 'active' |
| Updated listing | UPDATE changed fields, bump updated_at |
| Removed listing | SET deleted_at = NOW(), status = 'off_market' |
| Price change | UPDATE price fields, log old price in sync_log.changes |
| Image change | Upload new images to Storage, update URLs |
| Duplicate detected | Merge: keep higher quality_score, link aliases |

---

## 5. Secure Admin Architecture

### 5.1 Current State Assessment

- Admin login page exists but is **not functional** (mock submit)
- No Supabase Auth integration in admin routes
- No role-based access control enforcement
- createAdminClient() exists but is unused in admin pages

### 5.2 Authentication Flow

`	ext
+------------+      1. Login        +------------+
| Admin UI   | -------------------> |  Supabase  |
| (Next.js)  |                      |   Auth     |
+------------+ <-------------------+ +------------+
       |                                  |
       | 2. Session cookie               |
       |-------------------------------->|
       |                                  |
       | 3. Middleware validates          |
       |    session on every admin route  |
       |-------------------------------->|
       |                                  |
       | 4. JWT contains role claim       |
       |    (admin / editor / viewer)     |
       |                                  |
       v                                  v
+------------+                    +------------+
| Admin      |                    | RLS Policies|
| Dashboard  |                    | enforce     |
+------------+                    | access      |
                                  +------------+
`

### 5.3 Supabase Auth Setup

1. **Enable Email Auth** in Supabase Dashboard
2. **Create admin users** manually or via invitation
3. **Add custom claims** via uth.users metadata or a separate user_roles table

Recommended user_roles table:
`sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- RLS: users can read their own role, admins can manage all
CREATE POLICY "Users read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );
`

### 5.4 Middleware Protection

Update middleware.ts to protect admin routes:

`	ypescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Check role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!roleData || !['admin', 'editor'].includes(roleData.role)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}
`

### 5.5 Admin Dashboard Auth Integration

Update pp/[locale]/admin/layout.tsx:
1. Replace localStorage sidebar state with Supabase session check
2. Add logout button that calls supabase.auth.signOut()
3. Show current user email and role in header
4. Redirect to /admin/login if unauthenticated

Update pp/[locale]/admin/login/page.tsx:
1. Replace mock submit with supabase.auth.signInWithPassword()
2. Handle errors (invalid credentials, email not confirmed)
3. Redirect to /admin on success
4. Add "Remember me" using supabase.auth.setSession()

### 5.6 Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | Handled by Supabase Auth (bcrypt) |
| Session management | HttpOnly cookies, 1h expiry, refresh tokens |
| CSRF protection | Supabase built-in CSRF tokens |
| Rate limiting | Supabase built-in + custom middleware |
| RLS | All admin tables protected by role checks |
| Audit logging | sync_log + nalytics_events for all admin actions |
| MFA | Enable in Supabase Auth settings (optional) |
| IP allowlist | Supabase Auth allows IP restrictions |

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

| Task | Description | Files |
|------|-------------|-------|
| 1.1 Scraping Agent Scaffold | Create scripts/scrape-agent/ with TypeScript structure | New files |
| 1.2 Firecrawl Integration | Implement crawler with rate limiting, retries | crawler.ts |
| 1.3 Parser Implementation | Build robust markdown parser for property data | parser.ts |
| 1.4 Validator | Zod schemas for property, agent, blog post | alidator.ts |
| 1.5 Sync Queue Table | Add sync_log and sync_meta to Supabase | Migration SQL |
| 1.6 Admin Auth Basic | Implement Supabase Auth login/logout | dmin/login/page.tsx, middleware.ts |

### Phase 2: Core Sync (Week 3-4)

| Task | Description | Files |
|------|-------------|-------|
| 2.1 Upsert Logic | Implement idempotent property upsert with change detection | storage.ts |
| 2.2 Image Pipeline | Download images, upload to Supabase Storage, update URLs | storage.ts |
| 2.3 Reconciliation | Handle creates, updates, deletes, duplicates | sync.ts |
| 2.4 Error Handling | Retry queue, dead letter queue, alerting | queue.ts |
| 2.5 Testing | Unit tests for parser + validator | 	ests/ |
| 2.6 Admin Role Management | Build role assignment UI in admin dashboard | dmin/settings/page.tsx |

### Phase 3: Automation & Monitoring (Week 5-6)

| Task | Description | Files |
|------|-------------|-------|
| 3.1 Scheduled Scraping | Set up cron via Supabase Edge Function or GitHub Actions | .github/workflows/scrape.yml |
| 3.2 Monitoring Dashboard | Admin page showing sync status, errors, quality scores | New admin page |
| 3.3 Alerting | Email/Slack alerts on sync failures | Webhook integration |
| 3.4 Manual Trigger | Admin button to trigger immediate sync | Admin UI |
| 3.5 Rollback Mechanism | Ability to revert to previous sync snapshot | sync_log + restore script |

### Phase 4: Polish & Scale (Week 7-8)

| Task | Description | Files |
|------|-------------|-------|
| 4.1 Performance | Batch operations, connection pooling, indexing | SQL + code |
| 4.2 Caching | Cache parsed results, avoid re-scraping unchanged URLs | Redis or file cache |
| 4.3 Documentation | Full API docs, runbooks, troubleshooting guides | Docs |
| 4.4 Security Audit | Review RLS policies, auth flows, secrets management | Audit |
| 4.5 Load Testing | Simulate full site scrape, measure timing and cost | Test script |

---

## 7. Security Considerations

### 7.1 Secrets Management
- **Never** hardcode API keys in committed code
- Use Supabase Vault or environment variables injected at runtime
- Rotate Firecrawl API key quarterly
- Use service role key **only** in server-side Edge Functions / scripts

### 7.2 Access Control
- Admin routes protected by middleware + RLS
- Principle of least privilege: editors can edit content, cannot manage users
- All admin actions logged to nalytics_events

### 7.3 Data Privacy
- Scraped data is public information from EVA's own website
- No PII (emails, phones) scraped from public pages
- Lead data submitted via forms stored with consent

### 7.4 Infrastructure Security
- Supabase connection uses SSL/TLS
- Edge Functions run in isolated Deno runtime
- GitHub Actions use encrypted secrets
- .gitignore prevents secrets from being committed

---

## 8. Cost Analysis (Zero-Budget Constraints)

| Resource | Free Tier Limit | Estimated Usage | Cost |
|----------|----------------|-----------------|------|
| Supabase | 500 MB DB, 2 GB Storage, 10K MAU | Well within limits |  |
| Firecrawl | 500 credits/month | ~100-200 credits per full scrape |  |
| GitHub Actions | 500 min/month for public repo | ~30 min per full sync |  |
| Vercel | 100 GB bandwidth, 125 hrs serverless | Within limits for admin |  |
| Nominatim (Geocoding) | 1 req/sec, free | Minimal usage |  |

**Total monthly cost: **

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Scrape success rate | > 95% | sync_log action = 'created'/'updated' / total attempts |
| Sync freshness | < 24 hours | sync_meta.last_scraped_at age |
| Data quality score | > 0.8 average | sync_meta.quality_score |
| Duplicate rate | < 2% | Properties with matching external_id |
| Admin auth uptime | 99.9% | Supabase Auth status |
| Sync duration | < 10 minutes for full site | Edge Function execution time |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Source website structure changes | High | Parser versioning, fallback to manual review |
| Rate limiting / IP block | Medium | Rotate user agents, respect delays, use proxies if needed |
| Supabase free tier limits | Medium | Monitor usage, optimize queries, archive old data |
| Secrets exposure | High | .gitignore, Supabase Vault, code review |
| Data corruption | High | Dry-run mode, backups, transaction rollback |

---

## 11. Open Questions

1. Should secondary market properties be scraped from the same evadxb.com domain, or is there a separate source?
2. Does the existing Firecrawl API key have sufficient credits for daily full-site scrapes?
3. Should image downloads happen during scraping or in a separate post-processing step?
4. Is there a preferred time window for scheduled scrapes (e.g., 2 AM Dubai time)?
5. Should the sync agent run on Supabase Edge Functions or GitHub Actions?

---

## 12. Next Steps

1. Review and approve this specification
2. Set up Supabase sync_log and sync_meta schema changes
3. Create scripts/scrape-agent/ scaffold
4. Implement Phase 1 tasks
5. Run first dry-run sync on staging environment
