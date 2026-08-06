import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  await client.query(`
    CREATE OR REPLACE FUNCTION public.increment_property_views(p_property_id UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE public.properties SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_property_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('Created increment_property_views function');
  await client.end();
}).catch(err => console.error('Function error:', err.message));
