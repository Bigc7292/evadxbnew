import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  const res = await client.query("UPDATE public.properties SET status = 'secondary' WHERE status = 'ready' RETURNING id, title");
  console.log('Migrated rows:', res.rowCount);
  res.rows.forEach(r => console.log('  ' + r.id + ': ' + r.title));
  const check = await client.query("SELECT status, COUNT(*) FROM public.properties GROUP BY status ORDER BY status");
  console.log('Final counts:');
  check.rows.forEach(r => console.log('  ' + r.status + ': ' + r.count));
  await client.end();
}).catch(err => console.error('Migration error:', err.message));
