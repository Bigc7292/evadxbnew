const ALLOWED_WEBHOOK_ORIGINS = [
  'https://evadxb.com',
  'https://www.evadxb.com',
  process.env.WOOCOMMERCE_URL,
  process.env.GOYZER_API_URL,
].filter(Boolean) as string[];

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowedOrigins = ALLOWED_WEBHOOK_ORIGINS;
  const origin = allowedOrigins.includes(requestOrigin || '') ? requestOrigin : undefined;

  return {
    'Access-Control-Allow-Origin': origin || allowedOrigins[0] || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-goyzer-signature, x-wc-webhook-signature, x-wc-webhook-topic',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

export const corsHeaders = buildCorsHeaders(null);

export function getCorsHeaders(requestOrigin: string | null) {
  return buildCorsHeaders(requestOrigin);
}
