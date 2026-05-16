import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');

import { config } from 'dotenv';
config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('Connecting to database...');
  
  const { rows } = await pool.query(
    `SELECT id, email FROM users WHERE role = 'ADMIN' LIMIT 1`
  );

  if (!rows.length) {
    console.log('❌ No admin user found!');
    return;
  }

  console.log('ADMIN_ID=' + rows[0].id);
}

main()
  .then(() => pool.end())
  .catch((e) => {
    console.error('❌ Error:', e.message);
    pool.end();
  });
