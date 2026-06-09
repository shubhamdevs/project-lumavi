const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.argv[2] || 'postgresql://postgres.mvogxocmjjengvmtedqr:Shubham%40550@db.mvogxocmjjengvmtedqr.supabase.co:5432/postgres';

async function run() {
  console.log('Connecting to remote Supabase Postgres database...');
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected successfully!');

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const files = [
    '001_core_schema.sql',
    '002_rls_policies.sql',
    '003_indexes.sql',
    '004_pre_request.sql',
    '005_extend_brand_guidelines.sql'
  ];

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`\nExecuting migration: ${file}...`);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await client.query(sql);
      console.log(`Successfully completed migration: ${file}`);
    } catch (err) {
      console.error(`Error executing ${file}:`, err.message);
      // We don't throw to allow trying subsequent migrations if some tables already exist
    }
  }

  await client.end();
  console.log('\nAll migrations executed. Connection closed.');
}

run().catch(console.error);
