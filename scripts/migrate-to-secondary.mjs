import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  await client.query("UPDATE public.properties SET status = 'secondary' WHERE status = 'ready'");
  console.log('Updated ready -> secondary');
  await client.query("ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check");
  await client.query("ALTER TABLE public.properties ADD CONSTRAINT properties_status_check CHECK (status IN ('off_plan', 'secondary'))");
  console.log('Updated status constraint');
  const check = await client.query("SELECT status, COUNT(*) FROM public.properties GROUP BY status ORDER BY status");
  console.log('Final counts:');
  check.rows.forEach(r => console.log('  ' + r.status + ': ' + r.count));
  await client.end();
}).catch(err => console.error('Migration error:', err.message));
