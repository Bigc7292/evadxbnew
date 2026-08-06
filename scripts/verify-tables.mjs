import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  const tables = ['developers', 'projects', 'districts', 'chat_sessions', 'chat_messages', 'wishlists', 'partners', 'rewards', 'content_blocks', 'reviews', 'media_assets', 'property_views', 'sync_logs', 'notifications', 'comparisons', 'events', 'testimonials', 'external_webhooks'];
  for (const table of tables) {
    const res = await client.query("SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = $1) AS exists", [table]);
    console.log(table + ': ' + (res.rows[0].exists ? 'EXISTS' : 'MISSING'));
  }
  await client.end();
}).catch(err => console.error('Verification error:', err.message));
