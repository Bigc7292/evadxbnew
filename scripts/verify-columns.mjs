import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name IN ('agent_id', 'views_count', 'completion_date')");
  console.log('properties columns:', res.rows.map(r => r.column_name).join(', ') || 'NONE');
  const res2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'external_webhooks' AND column_name IN ('source', 'event_type', 'payload', 'processed', 'property_id', 'lead_id', 'error')");
  console.log('external_webhooks columns:', res2.rows.map(r => r.column_name).join(', ') || 'NONE');
  await client.end();
}).catch(err => console.error('Column verification error:', err.message));
