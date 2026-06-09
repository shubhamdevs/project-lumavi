const { Client } = require('pg');
const dns = require('dns').promises;

const regions = [
  'ap-south-1',     // Mumbai
  'us-east-1',     // N. Virginia
  'us-east-2',     // Ohio
  'us-west-1',     // N. California
  'us-west-2',     // Oregon
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'eu-west-1',     // Ireland
  'eu-west-2',     // London
  'eu-central-1',  // Frankfurt
  'ca-central-1',  // Canada
  'sa-east-1'      // Brazil
];

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  try {
    // 1. Resolve DNS first
    await dns.lookup(host);
    console.log(`Region ${region} DNS resolved successfully.`);

    // 2. Try to connect
    const connectionString = `postgresql://postgres.mvogxocmjjengvmtedqr:Shubham%40550@${host}:6543/postgres`;
    const client = new Client({ connectionString, connectionTimeoutMillis: 3000 });
    await client.connect();
    await client.end();
    console.log(`>>> Success! Connected to region: ${region}`);
    return connectionString;
  } catch (err) {
    console.error(`Connection failed for ${region}:`, err.message);
  }
  return null;
}

async function run() {
  console.log('Testing regions...');
  for (const region of regions) {
    const connStr = await testRegion(region);
    if (connStr) {
      console.log('\nUse this connection string to run migrations:');
      console.log(connStr);
      process.exit(0);
    }
  }
  console.log('Could not connect to any region.');
}

run().catch(console.error);
