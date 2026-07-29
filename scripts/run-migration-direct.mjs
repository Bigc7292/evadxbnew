import { default as pg } from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const client = new pg.Client({
    connectionString: 'postgresql://postgres:DCLrip7292!-130309@db.atkaxzfpwyhrvquvrenr.supabase.co:5432/postgres',
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected!');
    
    // Check schema
    const { rows: tables } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Existing tables:', tables.map(r => r.table_name));
    
    // Check properties table
    const { rows: count } = await client.query('SELECT COUNT(*)::int as cnt FROM properties');
    console.log('Properties count:', count[0].cnt);
    
    const { rows: agentsCount } = await client.query('SELECT COUNT(*)::int as cnt FROM agents');
    console.log('Agents count:', agentsCount[0].cnt);
    
    const { rows: blogCount } = await client.query('SELECT COUNT(*)::int as cnt FROM blog_posts');
    console.log('Blog posts count:', blogCount[0].cnt);
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    try { await client.end(); } catch(e) {}
  }
}
run();
