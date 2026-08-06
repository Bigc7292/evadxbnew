-- ============================================================================
-- P0 Fixes: status enum, missing columns, external_webhooks
-- ============================================================================

-- 1. Fix properties.status enum to include off_plan / ready / under_construction
ALTER TABLE IF EXISTS public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE IF EXISTS public.properties ADD CONSTRAINT properties_status_check 
  CHECK (status IN ('off_plan', 'ready', 'under_construction', 'active', 'pending', 'sold', 'rented', 'off_market', 'draft'));

-- 2. Add missing columns to properties
ALTER TABLE IF EXISTS public.properties 
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id),
  ADD COLUMN IF NOT EXISTS completion_date TEXT;

-- 3. Create external_webhooks table for Goyzer + WooCommerce logging
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
