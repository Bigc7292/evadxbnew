import { Client } from 'pg';
const client = new Client({ connectionString: 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres' });
client.connect().then(async () => {
  const res = await client.query("SELECT conname FROM pg_constraint WHERE conrelid = 'public.leads'::regclass AND conname = 'leads_email_source_page_unique'");
  if (res.rowCount === 0) {
    await client.query('ALTER TABLE public.leads ADD CONSTRAINT leads_email_source_page_unique UNIQUE (email, source_page)');
    console.log('Added leads unique constraint');
  } else {
    console.log('Constraint already exists');
  }
  await client.end();
}).catch(err => console.error('Constraint error:', err.message));
