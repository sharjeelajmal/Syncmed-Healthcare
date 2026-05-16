// Regenerates admin password hash using genSalt(10) — same as new settings.actions.ts logic
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

import { config } from 'dotenv';
config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const NEW_PASSWORD = 'Admin@12345';

  console.log('Connecting to database...');
  
  const { rows } = await pool.query(
    `SELECT id, email, "firstName", "lastName" FROM users WHERE role = 'ADMIN' LIMIT 1`
  );

  if (!rows.length) {
    console.log('❌ No admin user found!');
    return;
  }

  const user = rows[0];
  console.log('✅ Admin found:', user.email);

  // Use genSalt(10) — same as the fixed settings.actions.ts
  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(NEW_PASSWORD, salt);
  
  console.log('🔐 New hash generated with genSalt(10), length:', newHash.length);
  console.log('   Hash prefix (must be $2b$10$):', newHash.substring(0, 7));

  await pool.query(
    `UPDATE users SET "passwordHash" = $1 WHERE id = $2`,
    [newHash, user.id]
  );

  // Verify the hash works
  const verified = await bcrypt.compare(NEW_PASSWORD, newHash);
  console.log('✅ Hash verification test:', verified ? 'PASSED ✅' : 'FAILED ❌');
  
  if (verified) {
    console.log('\n🎉 Password reset complete!');
    console.log('   Email:    ', user.email);
    console.log('   Password: ', NEW_PASSWORD);
  }
}

main()
  .then(() => pool.end())
  .catch((e) => {
    console.error('❌ Error:', e.message);
    pool.end();
  });
