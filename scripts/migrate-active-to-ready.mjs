import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  const res = await client.query("UPDATE public.properties SET status = 'ready' WHERE status = 'active' RETURNING id, title");
  console.log('Migrated rows:', res.rowCount);
  res.rows.forEach(r => console.log('  ' + r.id + ': ' + r.title));
  await client.end();
}).catch(err => console.error('Migration error:', err.message));
