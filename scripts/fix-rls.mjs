import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  await client.query("DROP POLICY IF EXISTS \"Public read access for active and off-plan properties\" ON public.properties");
  await client.query("DROP POLICY IF EXISTS \"Public read access for published properties\" ON public.properties");
  await client.query("CREATE POLICY \"Public read access for off-plan and secondary properties\" ON public.properties FOR SELECT TO public USING ((status = ANY (ARRAY['off_plan'::text, 'secondary'::text])) AND (deleted_at IS NULL) AND ((published_at IS NULL) OR (published_at <= now())))");
  console.log('Updated RLS policy to allow off_plan and secondary');
  await client.end();
}).catch(err => console.error('RLS update error:', err.message));
