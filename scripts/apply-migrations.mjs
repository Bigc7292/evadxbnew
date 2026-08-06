import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = 'postgresql://postgres.atkaxzfpwyhrvquvrenr:DCLrip7292!-130309@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  console.log(`Running: ${path.basename(filePath)}`);
  await client.query(sql);
  console.log(`Done: ${path.basename(filePath)}`);
}

async function main() {
  await client.connect();
  const migrationsDir = path.join(__dirname, '..', 'supabase/migrations');
  const files = [
    '20240101000002_fix_properties_and_webhooks.sql',
    '20240101000003_feature_tables_p1.sql',
    '20240101000004_operational_tables_p2.sql',
    '20240101000005_nice_to_have_p3.sql',
  ];
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Missing: ${file}`);
      continue;
    }
    await runMigration(filePath);
  }
  await client.end();
  console.log('All migrations applied successfully');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
