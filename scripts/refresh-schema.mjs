import { default as pg } from 'pg';

async function refresh() {
  const client = new pg.Client({
    connectionString: 'postgresql://postgres:DCLrip7292!-130309@db.atkaxzfpwyhrvquvrenr.supabase.co:5432/postgres',
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const { rows } = await client.query('SELECT 1 as test');
    console.log('Test query:', JSON.stringify(rows));
    
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('Schema reload signal sent');
    
    // Verify tables exist
    const { rows: tables } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.map(r => r.table_name));
    
    await client.end();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err.message);
    try { await client.end(); } catch(e) {}
  }
}
refresh();
